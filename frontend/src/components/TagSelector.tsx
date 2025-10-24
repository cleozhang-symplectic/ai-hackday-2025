import { useState } from 'react';
import { Tag, TagColor } from '../types';

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTags: Tag[];
  onTagToggle: (tag: Tag) => void;
  onTagCreate: (tag: Omit<Tag, 'id'>) => void;
}

const TAG_COLORS: { value: TagColor; label: string }[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'purple', label: 'Purple' },
  { value: 'pink', label: 'Pink' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'gray', label: 'Gray' }
];

export const TagSelector = ({ availableTags, selectedTags, onTagToggle, onTagCreate }: TagSelectorProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagColor>('blue');
  const [isExpanded, setIsExpanded] = useState(false);

  const getTagColorClass = (color: TagColor) => {
    const colorMap: Record<TagColor, string> = {
      blue: 'tag-blue',
      green: 'tag-green',
      red: 'tag-red',
      yellow: 'tag-yellow',
      purple: 'tag-purple',
      pink: 'tag-pink',
      indigo: 'tag-indigo',
      gray: 'tag-gray'
    };
    return colorMap[color] || 'tag-gray';
  };

  const isTagSelected = (tag: Tag) => {
    return selectedTags.some(selectedTag => selectedTag.id === tag.id);
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    
    // Check if tag name already exists
    if (availableTags.some(tag => tag.name.toLowerCase() === newTagName.toLowerCase().trim())) {
      alert('A tag with this name already exists!');
      return;
    }

    onTagCreate({
      name: newTagName.trim(),
      color: newTagColor
    });

    setNewTagName('');
    setNewTagColor('blue');
    setShowCreateForm(false);
  };

  const availableUnselectedTags = availableTags.filter(tag => !isTagSelected(tag));

  return (
    <div className="tag-selector">
      {/* Collapsible Header */}
      <div className="tag-selector-header" onClick={() => setIsExpanded(!isExpanded)}>
        <label>Tags</label>
        <div className="tag-selector-summary">
          {selectedTags.length > 0 && (
            <div className="selected-tags-preview">
              {selectedTags.slice(0, 3).map(tag => (
                <span key={tag.id} className={`tag-mini ${getTagColorClass(tag.color)}`}>
                  {tag.name}
                </span>
              ))}
              {selectedTags.length > 3 && (
                <span className="more-tags">+{selectedTags.length - 3} more</span>
              )}
            </div>
          )}
          <button type="button" className="toggle-btn">
            {isExpanded ? '▼ Hide' : '▶ Show'} Tags
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="tag-selector-content">
          {/* Selected Tags Section */}
          <div className="selected-tags-section">
            <div className="section-header">
              <span className="section-title">Selected Tags</span>
              {selectedTags.length > 0 && (
                <span className="tag-count">({selectedTags.length})</span>
              )}
            </div>
            <div className="selected-tags-container">
              {selectedTags.length > 0 ? (
                selectedTags.map(tag => (
                  <span
                    key={tag.id}
                    className={`tag ${getTagColorClass(tag.color)} selected-tag`}
                    onClick={() => onTagToggle(tag)}
                    title="Click to remove"
                  >
                    {tag.name} ×
                  </span>
                ))
              ) : (
                <div className="no-selection-placeholder">
                  No tags selected. Click on available tags below to add them.
                </div>
              )}
            </div>
          </div>

          {/* Available Tags Section */}
          <div className="available-tags-section">
            <div className="section-header">
              <span className="section-title">Available Tags</span>
              {availableUnselectedTags.length > 0 && (
                <span className="tag-count">({availableUnselectedTags.length} available)</span>
              )}
            </div>
            <div className="available-tags-container">
              {availableUnselectedTags.length > 0 ? (
                availableUnselectedTags.map(tag => (
                  <span
                    key={tag.id}
                    className={`tag ${getTagColorClass(tag.color)} available-tag`}
                    onClick={() => onTagToggle(tag)}
                    title="Click to add"
                  >
                    + {tag.name}
                  </span>
                ))
              ) : (
                <div className="no-options-placeholder">
                  All tags are selected. Create a new tag below.
                </div>
              )}
            </div>
          </div>

          {/* Create New Tag Section */}
          <div className="create-tag-section">
            <div className="section-header">
              <span className="section-title">Create New Tag</span>
            </div>
            {!showCreateForm ? (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="show-create-tag-btn"
              >
                + Create New Tag
              </button>
            ) : (
              <div className="inline-create-form">
                <input
                  type="text"
                  placeholder="Enter tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="new-tag-input"
                  maxLength={20}
                />
                <select
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value as TagColor)}
                  className="new-tag-color"
                >
                  {TAG_COLORS.map(color => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={handleCreateTag} className="create-tag-confirm">
                  Create & Add
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewTagName('');
                    setNewTagColor('blue');
                  }}
                  className="create-tag-cancel"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};