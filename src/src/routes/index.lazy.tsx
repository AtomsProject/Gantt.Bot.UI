import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/')({
    component: Index,
})

function Index() {
    return (
        <div className="flex justify-center mt-28 font-sans ">
            <div className="p-2 mr-4 ml-4 max-w-4xl mx-auto bg-gray-950 text-gray-200 pb-10 pt-5 space-y-3 text-lg">
                <h1 className="text-4xl pb-3 border-gray-500 mb-3">An Open Invitation to Innovate Together</h1>
                <hr/>
                <p> As you explore Gantt Bot, you'll notice that our code is a work in progress, assembled with speed
                    and exploration in mind. We acknowledge it's not perfect—far from it. But this is more than a
                    project management tool; it's a call to action, a proof of concept designed to inspire. We invite
                    you to look beyond the imperfections, to see the potential and the possibilities that Gantt Bot
                    represents.
                </p>
                <p>
                    Our journey is driven by a singular vision: to demonstrate the untapped value of dynamic and
                    adaptive project scheduling. We believe that by pushing the boundaries of what's expected,
                    we can inspire change across the industry. Our aim is for features like Dynamic Priority Alignment,
                    customizable work types, and the nuanced understanding of resource allocation to become standard
                    facets of project management tools everywhere.
                </p>
                <p>
                    Gantt Bot is not even intended to be it's own project. It's an opportunity for all of us. Whether you're a developer, a
                    project manager, or part of a team that crafts project management software, we extend an open
                    invitation to experiment, to contribute, and to take these ideas forward. If the essence of Gantt
                    Bot inspires just one feature in another tool, we'll consider this mission a success.
                </p>
                <h2 className="text-3xl font-bold my-4">Notes:</h2>
                <ul className="list-disc list-inside">
                    <li>This site is provided as it, there is no support, use at your
                        own risk.</li>
                    <li>All data is stored in your browsers local storage.</li>
                    <li>We will have braking changes, that will cause data lose, and we will not provide any warning of such events.</li>
                </ul>
                <hr/>
                <h2 className="text-3xl font-bold my-4">What We Are Doing:</h2>
                <ul className="list-disc list-inside">
                    <li><strong>Automated Scheduling:</strong> Automatically assigns tasks based on dependencies,
                        resource availability, and priorities, including handling of partial-time tasks.
                    </li>
                    <li><strong>Gantt Chart Visualization:</strong> Offers a visual representation of tasks, sub-tasks,
                        dependencies, and project progress.
                    </li>
                    <li><strong>Dynamic Task Management:</strong> Allows for the creation, editing, deletion, and
                        hierarchical structuring of tasks and sub-tasks with unlimited dependencies.
                    </li>
                    <li><strong>Resource Allocation:</strong> Enables detailed management of team resources, including
                        custom work ratios and availability overrides.
                    </li>
                    <li><strong>Priority System:</strong> Features a comprehensive priority system for tasks and
                        resources to guide scheduling decisions.
                    </li>
                    <li><strong>Dynamic Priority Alignment (DPA):</strong> Integrates with the Program Evaluation and
                        Review Technique (PERT) for adaptive task prioritization based on ongoing project analysis.
                    </li>
                    <li><strong>Custom Work Types:</strong> Supports user-defined work types for greater flexibility in
                        task categorization.
                    </li>
                    <li><strong>Open Source Approach:</strong> Plans for open-source development with a focus on
                        community engagement and comprehensive documentation.
                    </li>
                </ul>
                <h2 className="text-3xl font-bold my-4">What's Not Normal:</h2>
                <ul className="list-disc list-inside">
                    <li><strong>DPA with PERT Integration:</strong> A unique approach to dynamically adjust task
                        priorities, optimizing resource allocation and minimizing delays, not commonly found in standard
                        scheduling tools.
                    </li>
                    <li><strong>Para Programming Task Support:</strong> Special handling of tasks that require
                        collaborative work efforts, like pair programming, reflecting modern software development
                        practices.
                    </li>
                    <li><strong>Flexible Resource Calendars:</strong> Beyond typical availability settings, it allows
                        for detailed customization of resource calendars, accommodating exceptions like time off or
                        part-time availabilities.
                    </li>
                    <li><strong>Gantt Chart with Advanced Dependencies:</strong> Unlike basic Gantt charts, this project
                        emphasizes a deep integration of task dependencies, including sub-tasks and milestones, for
                        precise project tracking.
                    </li>
                    <li><strong>User-Defined Work Types and Ratios:</strong> Moves away from predefined work categories
                        to allow teams to define their work types and ratios, adapting the tool to various project needs
                        and methodologies.
                    </li>
                </ul>
            </div>
        </div>
    )
}