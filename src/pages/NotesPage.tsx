import React, { useState } from "react";
import NoteCard from "../components/notes/NoteCard";
import NoteEditor from "../components/notes/NoteEditor";
import { useNotes } from "../hooks/useNotes";
import { NoteFormData } from "../types";

const Notes: React.FC = () => {
  const {
    sortedNotes,
    isLoading,
    error,
    addNote,
    updateNote,
    deleteNote,
    toggleNotePin,
  } = useNotes();
  const [isCreating, setIsCreating] = useState(false);

  // Show loading indicator while data is being fetched
  if (isLoading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if data fetching failed
  if (error) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 font-bold mb-2">Error loading notes</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async (noteData: NoteFormData) => {
    try {
      await addNote(noteData);
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

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

      {isCreating && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <NoteEditor
            onSave={handleSave}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNotes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            onEdit={(note) => {
              updateNote(note);
            }}
            onDelete={deleteNote}
            onTogglePin={toggleNotePin}
          />
        ))}
      </div>

      {sortedNotes.length === 0 && !isCreating && (
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
