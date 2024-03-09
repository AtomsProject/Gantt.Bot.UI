import {createRootRoute, Link, Outlet} from '@tanstack/react-router'
import {TanStackRouterDevtools} from '@tanstack/router-devtools'
import AppNavBar from "../AppNavBar.tsx";
import '../App.css';
import {ProjectProvider} from "../components/ProjectSelectionContext.tsx";
import {TaskProvider} from "../components/TaskContext.tsx";

export const Route = createRootRoute({
    component: () => (
        <>
            <ProjectProvider>
                <TaskProvider>
                    <AppNavBar/>
                    <Outlet/>
                </TaskProvider>
            </ProjectProvider>
            <TanStackRouterDevtools/>
        </>
    ),
})