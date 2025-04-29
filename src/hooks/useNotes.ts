import { useState, useMemo, useCallback, useEffect } from "react";
import { noteApi } from "../services/api";
import { Note, NoteFormData } from "../types";
import { useAuth } from "../context/AuthContext";

export const useNotes = () => {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch notes from API
  useEffect(() => {
    const fetchNotes = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await noteApi.getNotes();
        setNotes(data || []);
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError("Failed to load notes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [isAuthenticated]);

  // CRUD operations for notes
  const addNote = async (note: NoteFormData) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const newNote = await noteApi.createNote(note);
      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      console.error("Error adding note:", err);
      setError("Failed to add note");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNote = async (note: Note) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const updatedNote = await noteApi.updateNote(note._id, note);
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? updatedNote : n))
      );
      return updatedNote;
    } catch (err) {
      console.error("Error updating note:", err);
      setError("Failed to update note");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      console.log("deleting note", id);
      await noteApi.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Failed to delete note");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotePin = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const updatedNote = await noteApi.toggleNotePin(id);
      setNotes((prev) => prev.map((n) => (n._id === id ? updatedNote : n)));
      return updatedNote;
    } catch (err) {
      console.error("Error toggling note pin:", err);
      setError("Failed to toggle note pin");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected note
  const selectedNote = useMemo(() => {
    return notes.find((n) => n._id === selectedId);
  }, [notes, selectedId]);

  // Sort notes by pinned status and then by updated date
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      // First sort by pinned status
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then sort by updated date
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes]);

  // Handle note deletion with confirmation
  const handleDelete = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(id);
    }
  }, []);

  return {
    // Data
    notes,
    sortedNotes,
    selectedNote,
    isLoading,
    error,

    // State setters
    setSelectedId,

    // Current state
    selectedId,

    // Actions
    addNote,
    updateNote,
    deleteNote: handleDelete,
    toggleNotePin,
  };
};
