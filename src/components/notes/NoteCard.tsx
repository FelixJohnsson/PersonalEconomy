import React from "react";
import { Note } from "../../types/Note";
import { formatDate } from "../../utils/formatters";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-2 ${
        note.isPinned ? "border-blue-500" : "border-transparent"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{note.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onTogglePin(note.id)}
            className={`p-1 rounded-full hover:bg-gray-100 ${
              note.isPinned ? "text-blue-500" : "text-gray-400"
            }`}
            title={note.isPinned ? "Unpin note" : "Pin note"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(note)}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
            title="Edit note"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 rounded-full hover:bg-gray-100 text-red-500"
            title="Delete note"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="prose max-w-none mb-4">
        <p className="whitespace-pre-wrap">{note.content}</p>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex space-x-2">
          {note.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <span>Last updated: {formatDate(new Date(note.updatedAt))}</span>
      </div>
    </div>
  );
};

export default NoteCard;
