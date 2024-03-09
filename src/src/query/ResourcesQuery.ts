import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import * as ResourceRepository from '../localDb/ResourceRepository';

export function useUpdateResource() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ResourceRepository.updateResource,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['resources']});
        }
    });
}
