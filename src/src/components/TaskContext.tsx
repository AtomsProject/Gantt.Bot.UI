import React, {PropsWithChildren} from "react";
import { useHotkeys } from 'react-hotkeys-hook'

// We added a momo, so not using it right now.
interface TaskContextProps {
    editingTaskId: string | null;
    setEditingTaskId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const TaskContext = React.createContext<TaskContextProps>({
    editingTaskId: null, setEditingTaskId: () => {
    }
});

export const TaskProvider: React.FC<PropsWithChildren> = ({children}) => {
    const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
    useHotkeys('esc', () => setEditingTaskId(null))
    return (
        <TaskContext.Provider value={{editingTaskId, setEditingTaskId}}>
            {children}
        </TaskContext.Provider>
    );
};