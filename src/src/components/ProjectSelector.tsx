import React, {useRef} from "react";
import {ProjectContext} from "./ProjectSelectionContext.tsx";
import {useQuery} from "@tanstack/react-query";
import * as ProjectRepository from "../localDb/ProjectRepository.ts";
import {useHotkeys} from 'react-hotkeys-hook';

const ProjectSelector: React.FC = () => {
    const projectContext = React.useContext(ProjectContext);
    const selectRef = useRef<HTMLSelectElement>(null);
    useHotkeys('ctrl+i', () => {
            if (selectRef.current) {
                selectRef.current.focus();
            }
        }
    )

    if (!projectContext) return <></>

    const {editingProjectId, setEditingProjectId} = projectContext;

    const projectsQuery = useQuery({
        queryKey: ['projects'],
        queryFn: ProjectRepository.getAllProjects,
        refetchOnWindowFocus: true
    });

    return (
        <select
            value={editingProjectId ?? undefined}
            ref={selectRef}
            id="projectSelector"
            name="select project"
            aria-label={`Select the current project`}
            className='w-30 truncate pl-2 p-1 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            onChange={event => {
                event.preventDefault();
                const {value} = event.target;
                setEditingProjectId(value);
            }}
        >
            <option value="">Select Project</option>
            {projectsQuery.data?.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
            ))}
        </select>
    );
};

export default ProjectSelector;