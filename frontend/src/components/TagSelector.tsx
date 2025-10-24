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

  return (
    <div className="tag-selector">
      <label>Tags</label>
      
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="selected-tags">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className={`tag ${getTagColorClass(tag.color)} selected`}
              onClick={() => onTagToggle(tag)}
            >
              {tag.name} ×
            </span>
          ))}
        </div>
      )}

      {/* Available Tags */}
      <div className="available-tags">
        {availableTags.map(tag => (
          <span
            key={tag.id}
            className={`tag ${getTagColorClass(tag.color)} ${isTagSelected(tag) ? 'selected' : 'available'}`}
            onClick={() => onTagToggle(tag)}
          >
            {tag.name}
            {isTagSelected(tag) && ' ✓'}
          </span>
        ))}
      </div>

      {/* Create New Tag */}
      <div className="create-tag-section">
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
              placeholder="Tag name"
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
              Add
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
  );
};