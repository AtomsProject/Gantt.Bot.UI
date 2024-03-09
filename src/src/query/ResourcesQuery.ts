import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ResourceRepository from '../localDb/ResourceRepository';
import { ProjectContext } from "../components/ProjectSelectionContext.tsx";
import React from 'react';
import { Resource } from '../model/Resources.ts';

export function useUpdateResource() {
    const { editingProjectId } = React.useContext(ProjectContext)
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (r: Resource) => ResourceRepository.updateResource(editingProjectId ?? '', r),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['resources'] });
        }
    });
}
