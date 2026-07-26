'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { useStore } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAppForm } from '@/components/ui/tanstack-form';
import { cn, slugify } from '@/lib/utils';
import { getMediaByIds } from '../../media/api/client';
import { mediaKeys } from '../../media/api/queries';
import { MediaGalleryField } from '../../media/components/media-picker';
import { countLinks, SEO_LIMITS } from '../../seo/analyze';
import { KeywordInput } from '../../seo/components/keyword-input';
import { SeoAnalyzer } from '../../seo/components/seo-analyzer';
import { htmlToText, RichTextEditor } from '../../shared/rich-text-editor';
import {
  articleDraftSchema,
  articleFormSchema,
  emptyArticleValues,
  type ArticleFormValues
} from './schema';
import {
  createBlogCategory,
  createBlogTag,
  saveArticle,
  type SaveStatus,
  type TaxonomyOption
} from './service';

interface ArticleEditorProps {
  /** Present when editing an existing article. */
  id?: string;
  initialValues?: ArticleFormValues;
  /** Current persisted status, used to seed the Publish box select. */
  initialStatus?: string;
  categories: TaxonomyOption[];
  tags: TaxonomyOption[];
}

type AutosaveState = 'idle' | 'saving' | 'saved' | 'error';

const LOCAL_DRAFT_PREFIX = 'benroso-article-draft:';
const LOCAL_SAVE_MS = 400;
const SERVER_AUTOSAVE_MS = 1500;

function localDraftKey(articleId: string | undefined): string {
  return `${LOCAL_DRAFT_PREFIX}${articleId ?? 'new'}`;
}

function readLocalDraft(articleId: string | undefined): ArticleFormValues | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(localDraftKey(articleId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { values?: ArticleFormValues };
    return parsed.values ?? null;
  } catch {
    return null;
  }
}

function writeLocalDraft(articleId: string | undefined, values: ArticleFormValues): void {
  try {
    window.localStorage.setItem(
      localDraftKey(articleId),
      JSON.stringify({ updatedAt: Date.now(), values })
    );
  } catch {
    // Quota / private mode — ignore; server autosave still runs.
  }
}

function clearLocalDraft(articleId: string | undefined): void {
  try {
    window.localStorage.removeItem(localDraftKey(articleId));
  } catch {
    // ignore
  }
}

function draftIsRicher(local: ArticleFormValues, baseline: ArticleFormValues): boolean {
  const localBody = local.content?.trim().length ?? 0;
  const baseBody = baseline.content?.trim().length ?? 0;
  if (localBody > baseBody) return true;
  if (localBody < baseBody) return false;
  const localTitle = local.title?.trim().length ?? 0;
  const baseTitle = baseline.title?.trim().length ?? 0;
  return localTitle > baseTitle;
}

export function ArticleEditor({
  id,
  initialValues,
  initialStatus,
  categories: initialCategories,
  tags: initialTags
}: ArticleEditorProps) {
  const router = useRouter();
  const [articleId, setArticleId] = React.useState(id);
  const [pending, setPending] = React.useState<SaveStatus | null>(null);
  const [autosaveState, setAutosaveState] = React.useState<AutosaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);
  const [seoOpen, setSeoOpen] = React.useState(false);
  const [status, setStatus] = React.useState<SaveStatus>(
    initialStatus === 'published' ? 'published' : 'draft'
  );
  /** Status last written to the DB — autosave must not unpublish via the select alone. */
  const [persistedStatus, setPersistedStatus] = React.useState<SaveStatus>(
    initialStatus === 'published' ? 'published' : 'draft'
  );
  const [categories, setCategories] = React.useState<TaxonomyOption[]>(initialCategories);
  const [tags, setTags] = React.useState<TaxonomyOption[]>(initialTags);

  // Slug + SEO title track the title until the editor overrides them.
  const autoSlugRef = React.useRef(!id);
  const autoTitleRef = React.useRef(!id);
  const skipServerAutosaveRef = React.useRef(true);
  const serverSavingRef = React.useRef(false);
  const lastSavedSnapshotRef = React.useRef(JSON.stringify(initialValues ?? emptyArticleValues));
  const valuesRef = React.useRef(initialValues ?? emptyArticleValues);
  const articleIdRef = React.useRef(articleId);
  const persistedStatusRef = React.useRef(persistedStatus);

  const form = useAppForm({
    defaultValues: initialValues ?? emptyArticleValues,
    onSubmit: () => {
      // Saving is driven explicitly by the Publish box buttons below.
    }
  });

  const values = useStore(form.store, (state) => state.values);
  valuesRef.current = values;
  articleIdRef.current = articleId;
  persistedStatusRef.current = persistedStatus;

  // Restore browser-local draft after accidental refresh (before server autosave catches up).
  React.useEffect(() => {
    const baseline = initialValues ?? emptyArticleValues;
    const local = readLocalDraft(id);
    if (!local || !draftIsRicher(local, baseline)) return;

    (Object.keys(local) as Array<keyof ArticleFormValues>).forEach((key) => {
      form.setFieldValue(key, local[key]);
    });
    lastSavedSnapshotRef.current = '';
    toast.message('Restored unsaved changes from this browser.');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once on mount
  }, []);

  // Immediate local backup on every edit.
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      writeLocalDraft(articleId, values);
    }, LOCAL_SAVE_MS);
    return () => window.clearTimeout(timer);
  }, [articleId, values]);

  // Debounced server autosave once title + slug are valid.
  React.useEffect(() => {
    if (skipServerAutosaveRef.current) {
      skipServerAutosaveRef.current = false;
      return;
    }
    if (pending !== null || serverSavingRef.current) return;
    if (!articleDraftSchema.safeParse(values).success) return;
    if (JSON.stringify(values) === lastSavedSnapshotRef.current) return;

    const timer = window.setTimeout(() => {
      void runAutosave();
    }, SERVER_AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce on form values only
  }, [values, pending]);

  async function runAutosave() {
    if (serverSavingRef.current || pending !== null) return;
    const current = valuesRef.current;
    if (!articleDraftSchema.safeParse(current).success) return;
    if (JSON.stringify(current) === lastSavedSnapshotRef.current) return;

    serverSavingRef.current = true;
    setAutosaveState('saving');
    try {
      const result = await saveArticle({
        id: articleIdRef.current,
        values: current,
        status: persistedStatusRef.current
      });

      if (!articleIdRef.current) {
        setArticleId(result.id);
        articleIdRef.current = result.id;
        clearLocalDraft(undefined);
        writeLocalDraft(result.id, current);
        window.history.replaceState(null, '', `/portal/blog/${result.id}`);
      }

      lastSavedSnapshotRef.current = JSON.stringify(current);
      setLastSavedAt(new Date());
      setAutosaveState('saved');
    } catch {
      setAutosaveState('error');
    } finally {
      serverSavingRef.current = false;
    }
  }

  // Resolve the featured image so the SEO panel can report alt-text coverage.
  const featuredIds = values.featuredImage ? [values.featuredImage] : [];
  const { data: featuredAssets = [] } = useQuery({
    queryKey: [...mediaKeys.all, 'byIds', featuredIds],
    queryFn: () => getMediaByIds(featuredIds),
    enabled: featuredIds.length > 0
  });
  const imagesWithAlt = featuredAssets.filter(
    (asset) => (asset.alt ?? '').trim().length > 0
  ).length;

  const wordCount = React.useMemo(() => {
    const text = htmlToText(values.content).trim();
    return text ? text.split(/\s+/).length : 0;
  }, [values.content]);

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => createBlogCategory(name),
    onSuccess: (category) => {
      setCategories((prev) =>
        prev.some((item) => item.id === category.id) ? prev : [...prev, category]
      );
      const next = [...new Set([...values.categoryIds, category.id])];
      form.setFieldValue('categoryIds', next);
      if (!values.primaryCategoryId) form.setFieldValue('primaryCategoryId', category.id);
      toast.success(`Added category “${category.name}”.`);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Could not add category.')
  });

  const createTagMutation = useMutation({
    mutationFn: (name: string) => createBlogTag(name),
    onSuccess: (tag) => {
      setTags((prev) => (prev.some((item) => item.id === tag.id) ? prev : [...prev, tag]));
      form.setFieldValue('tagIds', [...new Set([...values.tagIds, tag.id])]);
      toast.success(`Added tag “${tag.name}”.`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not add tag.')
  });

  function toggleCategory(categoryId: string) {
    const current = values.categoryIds;
    const next = current.includes(categoryId)
      ? current.filter((value) => value !== categoryId)
      : [...current, categoryId];
    form.setFieldValue('categoryIds', next);
    // Keep the primary selection valid.
    if (!next.includes(values.primaryCategoryId)) {
      form.setFieldValue('primaryCategoryId', next[0] ?? '');
    } else if (!values.primaryCategoryId && next.length > 0) {
      form.setFieldValue('primaryCategoryId', next[0]);
    }
  }

  function toggleTag(tagId: string) {
    const current = values.tagIds;
    form.setFieldValue(
      'tagIds',
      current.includes(tagId) ? current.filter((value) => value !== tagId) : [...current, tagId]
    );
  }

  async function persist(nextStatus: SaveStatus) {
    const schema = nextStatus === 'published' ? articleFormSchema : articleDraftSchema;
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      await form.handleSubmit();
      toast.error(
        nextStatus === 'published'
          ? 'Fix the highlighted fields before publishing.'
          : 'Add a title and slug to save a draft.'
      );
      return;
    }

    setPending(nextStatus);
    setStatus(nextStatus);
    try {
      const result = await saveArticle({ id: articleId, values, status: nextStatus });
      setArticleId(result.id);
      setPersistedStatus(nextStatus);
      lastSavedSnapshotRef.current = JSON.stringify(values);
      clearLocalDraft(articleId);
      clearLocalDraft(result.id);
      clearLocalDraft(undefined);
      toast.success(nextStatus === 'published' ? 'Article published.' : 'Draft saved.');
      router.push('/portal/blog');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setPending(null);
    }
  }

  const autosaveLabel =
    autosaveState === 'saving'
      ? 'Saving…'
      : autosaveState === 'error'
        ? 'Autosave failed — try Save draft'
        : autosaveState === 'saved' && lastSavedAt
          ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : null;

  return (
    <form.AppForm>
      <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
        {/* Main column */}
        <div className='space-y-4'>
          <form.AppField
            name='title'
            listeners={{
              onChange: ({ value }) => {
                if (autoSlugRef.current) form.setFieldValue('slug', slugify(value));
                if (autoTitleRef.current) form.setFieldValue('seoTitle', value);
              }
            }}
          >
            {(field) => (
              <field.TextField
                label='Title'
                required
                placeholder='Add article title'
                className='h-12 text-lg'
              />
            )}
          </form.AppField>

          <form.AppField
            name='slug'
            listeners={{
              onChange: ({ value }) => {
                if (value !== slugify(form.getFieldValue('title'))) autoSlugRef.current = false;
              }
            }}
          >
            {(field) => (
              <div className='flex flex-wrap items-center gap-2 rounded-[3px] border bg-muted/40 px-3 py-2 text-sm'>
                <span className='text-muted-foreground'>Permalink:</span>
                <span className='text-muted-foreground'>/blog/</span>
                <Input
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className='h-7 w-auto min-w-48 flex-1'
                  placeholder='auto-generated-from-title'
                />
              </div>
            )}
          </form.AppField>

          <div className='grid gap-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='article-body'>Body</Label>
              <span className='text-muted-foreground text-xs'>{wordCount} words</span>
            </div>
            <RichTextEditor
              value={values.content}
              onChange={(html) => form.setFieldValue('content', html)}
              placeholder='Write the article…'
            />
          </div>

          {/* SEO toggle */}
          <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
            <Card className='gap-0 py-0'>
              <CollapsibleTrigger asChild>
                <button
                  type='button'
                  className='flex w-full items-center justify-between gap-2 px-6 py-4 text-left'
                >
                  <span className='flex items-center gap-2 font-semibold'>
                    <Icons.search className='size-4' />
                    SEO &amp; search appearance
                  </span>
                  <Icons.chevronDown
                    className={cn('size-4 transition-transform', seoOpen && 'rotate-180')}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='grid gap-4 border-t px-6 py-4 lg:grid-cols-[1fr_300px]'>
                  <div className='grid gap-4'>
                    <form.AppField name='seoTitle'>
                      {(field) => (
                        <field.TextField
                          label='SEO title'
                          placeholder={values.title || 'Defaults to the article title'}
                          maxLength={70}
                          description='Pre-filled from the title. Override for a custom search title.'
                        />
                      )}
                    </form.AppField>
                    <form.AppField name='seoDescription'>
                      {(field) => (
                        <field.TextareaField
                          label='Meta description'
                          placeholder='Shown in Google results and social shares.'
                          rows={3}
                          maxLength={SEO_LIMITS.metaMax}
                        />
                      )}
                    </form.AppField>
                    <KeywordInput
                      focusKeyword={values.focusKeyword}
                      keywords={values.keywords}
                      onFocusKeywordChange={(value) => form.setFieldValue('focusKeyword', value)}
                      onKeywordsChange={(value) => form.setFieldValue('keywords', value)}
                    />
                  </div>
                  <div className='lg:sticky lg:top-4 lg:self-start'>
                    <SeoAnalyzer
                      input={{
                        title: values.seoTitle || values.title,
                        metaDescription: values.seoDescription,
                        slug: values.slug,
                        focusKeyword: values.focusKeyword,
                        keywords: values.keywords,
                        body: `${values.excerpt} ${htmlToText(values.content)}`,
                        imageCount: featuredIds.length,
                        imagesWithAlt,
                        internalLinkCount: countLinks(values.content).internal,
                        outboundLinkCount: countLinks(values.content).outbound
                      }}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Sidebar */}
        <div className='space-y-4'>
          {/* Publish */}
          <Card className='gap-3 py-4'>
            <CardHeader className='px-4'>
              <div className='flex items-center justify-between gap-2'>
                <CardTitle className='text-sm'>Publish</CardTitle>
                {autosaveLabel ? (
                  <span
                    className={cn(
                      'text-xs',
                      autosaveState === 'error' ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {autosaveLabel}
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className='grid gap-3 px-4'>
              <div className='grid gap-1.5'>
                <Label htmlFor='publish-status'>Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as SaveStatus)}>
                  <SelectTrigger id='publish-status' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='draft'>Draft</SelectItem>
                    <SelectItem value='published'>Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <form.AppField name='featured'>
                {(field) => (
                  <Label htmlFor='article-featured' className='flex items-center gap-2 text-sm'>
                    <Checkbox
                      id='article-featured'
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked === true)}
                    />
                    Featured article
                  </Label>
                )}
              </form.AppField>

              <div className='grid gap-1.5'>
                <Label htmlFor='publish-slug'>Slug</Label>
                <Input
                  id='publish-slug'
                  value={values.slug}
                  onChange={(event) => {
                    autoSlugRef.current = false;
                    form.setFieldValue('slug', event.target.value);
                  }}
                />
              </div>

              <div className='flex flex-wrap gap-2 pt-1'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  isLoading={pending === 'draft'}
                  disabled={pending !== null}
                  onClick={() => void persist('draft')}
                >
                  Save draft
                </Button>
                <Button
                  type='button'
                  size='sm'
                  isLoading={pending === 'published'}
                  disabled={pending !== null}
                  onClick={() => void persist('published')}
                >
                  {initialStatus === 'published' ? 'Update' : 'Publish'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Featured image */}
          <Card className='gap-3 py-4'>
            <CardHeader className='px-4'>
              <CardTitle className='text-sm'>Featured image</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-3 px-4'>
              <MediaGalleryField
                value={featuredIds}
                onChange={(ids) => form.setFieldValue('featuredImage', ids[ids.length - 1] ?? '')}
                multiple={false}
                label='Image'
                description='Used as the cover and social share image.'
              />
              <form.AppField name='featuredImageCaption'>
                {(field) => (
                  <field.TextField label='Caption' placeholder='Optional image caption' />
                )}
              </form.AppField>
            </CardContent>
          </Card>

          {/* Categories */}
          <CategoryBox
            categories={categories}
            selectedIds={values.categoryIds}
            primaryId={values.primaryCategoryId}
            onToggle={toggleCategory}
            onSetPrimary={(categoryId) => form.setFieldValue('primaryCategoryId', categoryId)}
            onCreate={(name) => createCategoryMutation.mutate(name)}
            isCreating={createCategoryMutation.isPending}
          />

          {/* Tags */}
          <TagBox
            tags={tags}
            selectedIds={values.tagIds}
            onToggle={toggleTag}
            onCreate={(name) => createTagMutation.mutate(name)}
            isCreating={createTagMutation.isPending}
          />

          {/* Excerpt */}
          <Card className='gap-3 py-4'>
            <CardHeader className='px-4'>
              <CardTitle className='text-sm'>Excerpt</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-3 px-4'>
              <form.AppField name='excerpt'>
                {(field) => (
                  <field.TextareaField
                    label='Excerpt'
                    placeholder='Short summary shown on listing cards and search results.'
                    rows={4}
                    maxLength={320}
                  />
                )}
              </form.AppField>
              <p className='text-muted-foreground text-xs'>
                Full SEO controls live in the “SEO &amp; search appearance” panel below the body.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form.AppForm>
  );
}

interface CategoryBoxProps {
  categories: TaxonomyOption[];
  selectedIds: string[];
  primaryId: string;
  onToggle: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onCreate: (name: string) => void;
  isCreating: boolean;
}

function CategoryBox({
  categories,
  selectedIds,
  primaryId,
  onToggle,
  onSetPrimary,
  onCreate,
  isCreating
}: CategoryBoxProps) {
  const [name, setName] = React.useState('');

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName('');
  }

  return (
    <Card className='gap-3 py-4'>
      <CardHeader className='px-4'>
        <CardTitle className='text-sm'>Categories</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-3 px-4'>
        {categories.length === 0 ? (
          <p className='text-muted-foreground text-xs'>No categories yet. Add one below.</p>
        ) : (
          <div className='grid max-h-48 gap-1.5 overflow-y-auto'>
            {categories.map((category) => {
              const checked = selectedIds.includes(category.id);
              return (
                <div key={category.id} className='flex items-center justify-between gap-2 text-sm'>
                  <Label htmlFor={`cat-${category.id}`} className='flex items-center gap-2'>
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={checked}
                      onCheckedChange={() => onToggle(category.id)}
                    />
                    {category.name}
                  </Label>
                  {checked ? (
                    <button
                      type='button'
                      onClick={() => onSetPrimary(category.id)}
                      className={cn(
                        'text-xs',
                        primaryId === category.id
                          ? 'font-semibold text-[#3c5142]'
                          : 'text-muted-foreground hover:text-[#3c5142]'
                      )}
                    >
                      {primaryId === category.id ? 'Primary' : 'Make primary'}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
        <div className='flex items-center gap-2 border-t pt-3'>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAdd();
              }
            }}
            placeholder='New category'
            className='h-8'
          />
          <Button
            type='button'
            size='sm'
            variant='outline'
            isLoading={isCreating}
            onClick={handleAdd}
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface TagBoxProps {
  tags: TaxonomyOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onCreate: (name: string) => void;
  isCreating: boolean;
}

function TagBox({ tags, selectedIds, onToggle, onCreate, isCreating }: TagBoxProps) {
  const [name, setName] = React.useState('');

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName('');
  }

  return (
    <Card className='gap-3 py-4'>
      <CardHeader className='px-4'>
        <CardTitle className='text-sm'>Tags</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-3 px-4'>
        {tags.length === 0 ? (
          <p className='text-muted-foreground text-xs'>No tags yet. Add one below.</p>
        ) : (
          <div className='grid max-h-48 gap-1.5 overflow-y-auto'>
            {tags.map((tag) => (
              <Label
                htmlFor={`tag-${tag.id}`}
                key={tag.id}
                className='flex items-center gap-2 text-sm'
              >
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={selectedIds.includes(tag.id)}
                  onCheckedChange={() => onToggle(tag.id)}
                />
                {tag.name}
              </Label>
            ))}
          </div>
        )}
        <div className='flex items-center gap-2 border-t pt-3'>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAdd();
              }
            }}
            placeholder='New tag'
            className='h-8'
          />
          <Button
            type='button'
            size='sm'
            variant='outline'
            isLoading={isCreating}
            onClick={handleAdd}
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
