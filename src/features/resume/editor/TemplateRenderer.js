import React from 'react';
import SiliconArchitect from './SiliconArchitect';
// Baaki templates yahan import honge...

const TemplateRenderer = ({ templateId, data, theme }) => {
    // Ye 'data' MongoDB se aayega aur 'theme' user ke selections se [cite: 24, 147]
    switch (templateId) {
        case 'tech-dark-v2':
            return <SiliconArchitect data={data} theme={theme} />;
        // Case for other 5 templates...
        default:
            return <div className="p-10 text-white">Please select a valid professional template.</div>;
    }
};

export default TemplateRenderer;