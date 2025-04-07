import React, { useState } from "react";
import { Note } from "../types/Note";
import NoteCard from "../components/notes/NoteCard";
import NoteEditor from "../components/notes/NoteEditor";
import { useAppContext } from "../context/AppContext";

const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, toggleNotePin } =
    useAppContext();
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (
    noteData: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingNote) {
      updateNote({ ...editingNote, ...noteData });
      setEditingNote(undefined);
    } else {
      addNote(noteData);
    }
    setIsCreating(false);
  };

  const handleDelete = (noteId: string) => {
    deleteNote(noteId);
  };

  const handleTogglePin = (noteId: string) => {
    toggleNotePin(noteId);
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-6 pb-10">
      <section className="py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Financial Notes</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Note
          </button>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Keep track of important financial decisions, reminders, and insights.
        </p>
      </section>

      {(isCreating || editingNote) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <NoteEditor
            note={editingNote}
            onSave={handleSave}
            onCancel={() => {
              setEditingNote(undefined);
              setIsCreating(false);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={setEditingNote}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
          />
        ))}
      </div>

      {notes.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No notes yet. Create your first note to get started!
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Create a note
          </button>
        </div>
      )}
    </div>
  );
};

export default Notes;
