import { queryOptions } from '@tanstack/react-query';

import { listTeamMembers } from './service';

export const teamMemberKeys = {
  all: ['team-members'] as const,
  list: () => [...teamMemberKeys.all, 'list'] as const
};

export const teamMembersQueryOptions = () =>
  queryOptions({
    queryKey: teamMemberKeys.list(),
    queryFn: listTeamMembers
  });
