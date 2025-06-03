import React, { useState } from 'react';
import './PRGenerator.css';

const PRPreview = ({ prData, onEdit, onUse }) => {
  const [activeTab, setActiveTab] = useState('preview');
  
  const handleCopy = () => {
    navigator.clipboard.writeText(prData.fullContent);
    alert('Press release copied to clipboard!');
  };
  
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([prData.fullContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${prData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <div className="pr-preview">
      <div className="preview-tabs">
        <button 
          className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          📄 Preview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
          onClick={() => setActiveTab('raw')}
        >
          📝 Raw Text
        </button>
      </div>
      
      <div className="preview-actions">
        <button className="btn btn-outline" onClick={handleCopy}>
          📋 Copy
        </button>
        <button className="btn btn-outline" onClick={handleDownload}>
          💾 Download
        </button>
      </div>
      
      {activeTab === 'preview' ? (
        <div className="pr-preview-content">
          <div className="pr-header">
            <h1>{prData.title}</h1>
            <div className="pr-summary">
              <strong>Summary:</strong> {prData.summary}
            </div>
          </div>
          
          <div className="pr-body">
            {prData.fullContent.split('\n').map((paragraph, index) => (
              <p key={index} className={paragraph.includes('FOR IMMEDIATE RELEASE') ? 'release-header' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
          
          {prData.suggestedTags && prData.suggestedTags.length > 0 && (
            <div className="suggested-tags">
              <h4>Suggested Tags:</h4>
              <div className="tags">
                {prData.suggestedTags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="pr-raw-content">
          <pre>{prData.fullContent}</pre>
        </div>
      )}
    </div>
  );
};

export default PRPreview;

