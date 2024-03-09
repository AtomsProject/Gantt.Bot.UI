import React from 'react';
import {Link, useNavigate} from '@tanstack/react-router'
import ProjectSelector from "./components/ProjectSelector.tsx";
import {useHotkeys} from 'react-hotkeys-hook';

const linkClassBase = "";// "block py-2 px-3 md:p-0"
export const inactiveLinkClass = " text-gray-900 hover:text-blue-900 dark:text-white dark:hover:text-blue-500"
export const activeLinkClasses = " text-blue-900 dark:text-blue-500"

const navLinksClasses = "font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 dark:border-gray-700 rounded-lg md:flex-row md:space-x-8 md:mt-0 md:border-0 "

function AppNavBar() {
    const nav = useNavigate();
    useHotkeys('ctrl+b', () => {
           nav({to: '/Tasks'}).then(r => console.debug(r))
        }
    )
    
    useHotkeys('ctrl+v',  () => {
            nav({to: '/Resources'}).then(r => console.debug(r))
        }
    )
    
    return (
        <div className="max-w-screen-xl flex flex-wrap items-center justify-center mx-auto">
            <nav className="fixed top-0 w-full z-10 bg-white border-gray-200 dark:bg-gray-800">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        {/*<img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo"/>*/}
                        <span
                            className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Gantt Bot</span>
                    </Link>
                    <button data-collapse-toggle="navbar-default" type="button"
                            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-600 dark:focus:ring-gray-500"
                            aria-controls="navbar-default" aria-expanded="false">
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M1 1h15M1 7h15M1 13h15"/>
                        </svg>
                    </button>
                    <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                        <ul className={navLinksClasses}>
                            <li>
                                <Link to="/WorkTypes"
                                      activeProps={{className: linkClassBase + activeLinkClasses}}
                                      inactiveProps={{className: linkClassBase + inactiveLinkClass}}
                                >Work Types</Link>
                            </li>
                            <li>
                                <Link to="/Resources"
                                      activeProps={{className: linkClassBase + activeLinkClasses}}
                                      inactiveProps={{className: linkClassBase + inactiveLinkClass}}
                                >Resources</Link>
                            </li>
                            <li>
                                <Link to="/Tasks"
                                      activeProps={{className: linkClassBase + activeLinkClasses}}
                                      inactiveProps={{className: linkClassBase + inactiveLinkClass}}>Tasks</Link>
                            </li>
                            <li>
                                <Link to="/Schedule"
                                      activeProps={{className: linkClassBase + activeLinkClasses}}
                                      inactiveProps={{className: linkClassBase + inactiveLinkClass}}>Schedule</Link>
                            </li>
                            <li className='flex justify-center'>
                                <Link className='pr-2 pb-0' to="/Projects"
                                      activeProps={{className: linkClassBase + activeLinkClasses}}
                                      inactiveProps={{className: linkClassBase + inactiveLinkClass}}
                                >Project</Link>
                                <ProjectSelector/>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default AppNavBar;