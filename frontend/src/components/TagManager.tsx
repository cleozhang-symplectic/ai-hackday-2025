import { useState } from 'react';
import { Tag, TagColor } from '../types';

interface TagManagerProps {
  availableTags: Tag[];
  onTagCreate: (tag: Omit<Tag, 'id'>) => void;
  onTagDelete: (tagId: string) => void;
}

const TAG_COLORS: { value: TagColor; label: string; bgClass: string }[] = [
  { value: 'blue', label: 'Blue', bgClass: 'bg-blue-100 text-blue-800' },
  { value: 'green', label: 'Green', bgClass: 'bg-green-100 text-green-800' },
  { value: 'red', label: 'Red', bgClass: 'bg-red-100 text-red-800' },
  { value: 'yellow', label: 'Yellow', bgClass: 'bg-yellow-100 text-yellow-800' },
  { value: 'purple', label: 'Purple', bgClass: 'bg-purple-100 text-purple-800' },
  { value: 'pink', label: 'Pink', bgClass: 'bg-pink-100 text-pink-800' },
  { value: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-100 text-indigo-800' },
  { value: 'gray', label: 'Gray', bgClass: 'bg-gray-100 text-gray-800' }
];

export const TagManager = ({ availableTags, onTagCreate, onTagDelete }: TagManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagColor>('blue');

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
    setIsCreating(false);
  };

  const handleCancel = () => {
    setNewTagName('');
    setNewTagColor('blue');
    setIsCreating(false);
  };

  const getTagColorClass = (color: TagColor) => {
    const colorConfig = TAG_COLORS.find(c => c.value === color);
    return colorConfig?.bgClass || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="tag-manager">
      <div className="tag-manager-header">
        <h3>Manage Tags</h3>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="create-tag-btn">
            + New Tag
          </button>
        )}
      </div>

      {isCreating && (
        <div className="create-tag-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="tag-name-input"
              maxLength={20}
            />
            <select
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value as TagColor)}
              className="tag-color-select"
            >
              {TAG_COLORS.map(color => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button onClick={handleCreateTag} className="save-tag-btn">
              Create
            </button>
            <button onClick={handleCancel} className="cancel-tag-btn">
              Cancel
            </button>
          </div>
          {newTagName && (
            <div className="tag-preview">
              Preview: <span className={`tag ${getTagColorClass(newTagColor)}`}>
                {newTagName}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="existing-tags">
        {availableTags.length > 0 ? (
          <div className="tags-grid">
            {availableTags.map(tag => (
              <div key={tag.id} className="tag-item">
                <span className={`tag ${getTagColorClass(tag.color)}`}>
                  {tag.name}
                </span>
                <button 
                  onClick={() => onTagDelete(tag.id)}
                  className="delete-tag-btn"
                  title="Delete tag"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-tags">No tags created yet. Create your first tag!</p>
        )}
      </div>
    </div>
  );
};