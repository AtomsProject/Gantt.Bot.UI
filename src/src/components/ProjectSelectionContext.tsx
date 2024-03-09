
// We added a momo, so not using it right now.
import React, {PropsWithChildren, useEffect} from "react";

interface ProjectContextProps {
    editingProjectId: string | null;
    //setEditingProjectId: React.Dispatch<React.SetStateAction<string | null>>;
    setEditingProjectId: (projectId: string | null) => void;
}

export const ProjectContext = React.createContext<ProjectContextProps>({editingProjectId: null, setEditingProjectId: ()=>{}});
export const ProjectProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [editingProjectId, setEditingProjectId] = React.useState<string | null>(null);

    useEffect(() => {
        const projectId = localStorage.getItem('editingProjectId');
        if (projectId) {
            setEditingProjectId(projectId);
        }
    }, []);
    
    const setEditingProjectIdWithLocalStorage = (projectId: string | null) => {
        if (projectId) {
            localStorage.setItem('editingProjectId', projectId);
        } else {
            localStorage.removeItem('editingProjectId');
        }
        setEditingProjectId(projectId);
    }
    
    return (
        <ProjectContext.Provider value={{ editingProjectId, setEditingProjectId: setEditingProjectIdWithLocalStorage }}>
            {children}
        </ProjectContext.Provider>
    );
};