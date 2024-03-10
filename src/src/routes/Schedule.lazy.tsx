import { createLazyFileRoute, Outlet } from '@tanstack/react-router';
import { Mermaid } from "../components/Mermaid.tsx";
import React, { useEffect, useState } from "react";
import { ProjectContext } from "../components/ProjectSelectionContext.tsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clearSimulationResult, getSimulationResult } from "../localDb/SimulationRepository";
import TabDelimitedTable from "../components/TabDelimitedTable.tsx";
import { SimulationResult } from '../model/SchedulingTask.ts';

export const Route = createLazyFileRoute('/Schedule')({
    component: Index,
})

function Index() {
    const { editingProjectId } = React.useContext(ProjectContext);
    const [selectedGraph, setSelectedGraph] = useState('resourceSchedule');
    const [selectedConfidence, setSelectedConfidence] = useState('90');
    const queryClient = useQueryClient();
    const [copySuccess, setCopySuccess] = useState<boolean | null>(false);

    const projectQuery = useQuery({
        queryKey: ['project', editingProjectId, 'simulationResult', selectedConfidence],
        queryFn: () => getSimulationResult(editingProjectId ?? '', selectedConfidence),
        enabled: !!editingProjectId
    });

    useEffect(() => {
        setCopySuccess(null);
    }, [projectQuery.data, selectedGraph]);

    let graphMessage: string | null | undefined;
    let graphToDisplay: string | null | undefined;
    if (projectQuery.data === undefined || projectQuery.data === null) {
        graphMessage = projectQuery.isFetching ? "loading…" : "No data";
    } else if (typeof projectQuery.data === 'string') {
        graphMessage = projectQuery.data;
    }
    else {
        const simulationData = projectQuery.data as SimulationResult;
        switch (selectedGraph) {
            case 'projectSchedule':
                graphToDisplay = simulationData.projectSchedule;
                break;
            case 'milestoneSchedule':
                graphToDisplay = simulationData.milestoneSchedule;
                break;
            case 'resourceSchedule':
                graphToDisplay = simulationData.resourceSchedule;
                break;
            case 'resourceProjectSchedule':
                graphToDisplay = simulationData.resourceProjectSchedule;
                break;
            case 'taskMap':
                graphToDisplay = simulationData.taskMap;
                break;
            case 'taskMapDepth':
                graphToDisplay = simulationData.taskMapDepth;
                break;
            case 'table':
                graphToDisplay = simulationData.table;
                break;
            default:
                graphToDisplay = null;
        }
    }

    return (
        <div className="flex flex-row min-h-screen nav-body-padding">
            <div className="w-44 md:w-52 bg-white dark:bg-gray-800 fixed pb-20 md:pb-16 h-full">
                <div className='h-full overflow-y-auto pb-8 space-y-3'>
                    <div
                        className='pt-1 pl-3 pb-2 flex justify-between items-center text-center border-b-2 border-gray-600 bg-white dark:bg-gray-900'>
                        <h2 className='text-lg lg:text-xl'>Schedule Options</h2>
                    </div>
                    <div className='space-y-3 ml-2 pr-3'>
                        <button className='btn-sm btn-blue-outline w-full' onClick={async e => {
                            e.preventDefault();
                            if (editingProjectId) {
                                clearSimulationResult(editingProjectId ?? '');
                                await queryClient.invalidateQueries({ queryKey: ['project', editingProjectId, 'simulationResult'] });
                            }
                        }}>Refresh
                        </button>
                        <div className='w-full'>
                            <label htmlFor="graphSelector"
                                className="block text-xs font-medium text-gray-600 dark:text-gray-500">
                                Confidence</label>
                            <select
                                id="Confidence"
                                name="Confidenceh"
                                aria-label={`Select the confidence percentage`}
                                className='w-full truncate mt-1.5 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                value={selectedConfidence}
                                onChange={(e) => {
                                    e.preventDefault();
                                    setSelectedConfidence(e.target.value);
                                }}>
                                <option value="98">98%</option>
                                <option value="90">90%</option>
                                <option value="80">80%</option>
                                <option value="75">75%</option>
                                <option value="range">70% - 95%</option>
                            </select>
                        </div>
                        <div className='w-full'>
                            <label htmlFor="graphSelector"
                                className="block text-xs font-medium text-gray-600 dark:text-gray-500">
                                Select Graph type</label>
                            <select
                                id="graphSelector"
                                name="Select Graph"
                                aria-label={`Select the graph type`}
                                className='w-full truncate mt-1.5 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                value={selectedGraph}
                                onChange={(e) => {
                                    e.preventDefault();
                                    setSelectedGraph(e.target.value);
                                }}>
                                <option value="resourceSchedule">Resource Schedule</option>
                                <option value="projectSchedule">Project Schedule</option>
                                <option value="milestoneSchedule">Project Milestones</option>
                                <option value="resourceProjectSchedule">Project Resources</option>
                                <option value="taskMap">Task Map</option>
                                <option value="taskMapDepth">Task Depth Map</option>
                                <option value="table">Table</option>
                            </select>
                        </div>
                        <button className='btn-sm btn-blue-outline w-full' onClick={async e => {
                            e.preventDefault();
                            if (editingProjectId && graphToDisplay) {
                                navigator.clipboard.writeText(graphToDisplay)
                                    .then(() => {
                                        setCopySuccess(true);
                                    }, () => {
                                        setCopySuccess(false);
                                    });
                            }
                        }}>Copy Markdown
                        </button>
                        <div>
                            <span className='text-gray-500 text-sm'>Edit the markdown in a live editor with </span>
                            <a href='https://mermaid.live/'
                                className='text-xs text-blue-600 dark:text-blue-500 hover:underline'
                                target='_blank'
                                rel='noreferrer'>
                                Mermaid Live.</a>
                        </div>
                        {copySuccess && <div
                            className='text-green-600 text-xs'>{copySuccess ? "Copied to clipboard" : "Error copying to clipboard"}</div>}
                    </div>
                    {graphToDisplay && (
                        projectQuery.isFetching ?
                            <div className='text-center text-xl text-yellow-200 font-bold'>Loading…</div>
                            : projectQuery.isError && <div
                                className='text-center text-2xl text-red-500 font-bold'>"Refresh Error…</div>)
                    }
                </div>
            </div>
            <div className="ml-44 md:ml-52 flex-1 flex justify-stretch px-3">
                {graphToDisplay
                    ? selectedGraph === 'table'
                        ? <TabDelimitedTable data={graphToDisplay} />
                        : <Mermaid text={graphToDisplay} />
                    : <div className='p-3 text-xl'>{projectQuery.isError ? "Error" : graphMessage}</div>}
            </div>
        </div>
    );
}