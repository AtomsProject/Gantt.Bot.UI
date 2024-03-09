import React, {useEffect, useRef} from "react";
import mermaid, {RenderResult} from "mermaid";

export interface MermaidProps {
    text: string;
}

export const Mermaid: React.FC<MermaidProps> = ({text}) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const isRendering = useRef(false);
    
    useEffect(() => {
        mermaid.mermaidAPI.initialize({
            startOnLoad: true,
            securityLevel: 'strict',
            theme: "dark",
            logLevel: 5
        });
    });

    useEffect(() => {
        if (ref.current && text !== "" && !isRendering.current) {
            isRendering.current = true;
            ref.current.innerHTML= "";
            mermaid.mermaidAPI.render("preview", text, ref.current)
                .then((renderResult: RenderResult) => {
                    // The SVG code of the rendered diagram
                    if (ref.current) {
                        ref.current.innerHTML= "";
                        ref.current.innerHTML = renderResult.svg;
                    }
                    // Call the bindFunctions method after the SVG has been inserted into the DOM
                    if (renderResult.bindFunctions && ref.current) {
                        renderResult.bindFunctions(ref.current);
                    }
                    isRendering.current = false;
                })
                .catch((error: any) => {
                    console.error(error);
                    isRendering.current = false;
                });
        }
    }, [text]); // Add ref.current as a dependency

    return <div className='w-full' key="preview" ref={ref}/>;
};
