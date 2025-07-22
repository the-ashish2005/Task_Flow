
import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Pin, MoreVertical, StickyNote } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";


const StickyWall = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteColor, setNoteColor] = useState("orange");

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("sticky-notes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else if (stickyNotes.length > 0) {
      // Initial data for first time users
      setNotes(stickyNotes);
      localStorage.setItem("sticky-notes", JSON.stringify(stickyNotes));
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem("sticky-notes")) {
      localStorage.setItem("sticky-notes", JSON.stringify(notes));
    }
  }, [notes]);

  const handleCreateNote = () => {
    if (!noteTitle.trim()) {
      toast({
        title: "Error",
        description: "Note title cannot be empty",
        variant: "destructive"
      });
      return;
    }

    const newNote = {
      id: uuidv4(),
      title: noteTitle,
      content: noteContent,
      color: noteColor,
      createdAt: new Date().toISOString(),
      isPinned: false
    };

    setNotes([...notes, newNote]);
    clearForm();
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Note created",
      description: "Your note has been added to the wall"
    });
  };

  const handleEditNote = () => {
    if (!currentNote) return;
    
    if (!noteTitle.trim()) {
      toast({
        title: "Error",
        description: "Note title cannot be empty",
        variant: "destructive"
      });
      return;
    }

    const updatedNotes = notes.map(note => 
      note.id === currentNote.id 
        ? { 
            ...note, 
            title: noteTitle, 
            content: noteContent, 
            color: noteColor 
          }
        : note
    );

    setNotes(updatedNotes);
    clearForm();
    setIsEditDialogOpen(false);
    
    toast({
      title: "Note updated",
      description: "Your changes have been saved"
    });
  };

  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    toast({
      title: "Note deleted",
      description: "Your note has been removed"
    });
  };

  const togglePinNote = (id) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    );
    
    setNotes(updatedNotes);
    
    toast({
      title: updatedNotes.find(note => note.id === id)?.isPinned 
        ? "Note pinned" 
        : "Note unpinned",
      description: "Your note has been updated"
    });
  };

  const openEditDialog = (note) => {
    setCurrentNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteColor(note.color);
    setIsEditDialogOpen(true);
  };

  const clearForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setNoteColor("orange");
    setCurrentNote(null);
  };

  // Available colors for notes with better contrast
  const colorOptions = [
    { name: "Yellow", value: "yellow", bgClass: "bg-yellow-200 dark:bg-yellow-300", textClass: "text-yellow-900" },
    { name: "Orange", value: "orange", bgClass: "bg-orange-200 dark:bg-orange-300", textClass: "text-orange-900" },
    { name: "Green", value: "green", bgClass: "bg-green-200 dark:bg-green-300", textClass: "text-green-900" },
    { name: "Purple", value: "purple", bgClass: "bg-purple-200 dark:bg-purple-300", textClass: "text-purple-900" },
    { name: "Blue", value: "blue", bgClass: "bg-blue-200 dark:bg-blue-300", textClass: "text-blue-900" },
  ];

  // Helper function to get note styling
  const getNoteStyle = (color) => {
    const colorOption = colorOptions.find(option => option.value === color) || colorOptions[1]; // Default to orange
    return {
      bgClass: colorOption.bgClass,
      textClass: colorOption.textClass
    };
  };

  // Group notes into pinned and others
  const pinnedNotes = notes.filter(note => note.isPinned);
  const otherNotes = notes.filter(note => !note.isPinned);

  return (
    <MainLayout title="Sticky Wall">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-primary" />
          <p className="text-muted-foreground">Capture your thoughts, ideas, and reminders</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <>
          <h2 className="text-lg font-medium text-foreground mb-3">Pinned</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 auto-rows-auto">
            {pinnedNotes.map((note) => (
              <Card 
                key={note.id} 
                className={`${getNoteStyle(note.color).bgClass} shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-none rounded-xl overflow-hidden h-auto flex flex-col relative group`}
              >
                {/* Pin indicator */}
                <div className="absolute top-2 right-2 z-10">
                  <Pin className={`h-4 w-4 ${getNoteStyle(note.color).textClass} fill-current`} />
                </div>
                
                <CardHeader className="pb-3 pt-6 px-5">
                  <CardTitle className="text-lg leading-tight">
                    <span className={`break-words font-semibold ${getNoteStyle(note.color).textClass} line-clamp-2`}>{note.title}</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pb-2 px-5 flex-grow">
                  <div className="bg-white/30 dark:bg-black/20 backdrop-blur-sm rounded-lg p-4 min-h-[120px] border border-white/50 dark:border-gray-700/50">
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${getNoteStyle(note.color).textClass} line-clamp-8`}>{note.content}</p>
                  </div>
                </CardContent>
                
                <CardFooter className="px-5 py-1.5 flex justify-between items-center bg-white/20 dark:bg-black/10 backdrop-blur-sm border-t border-white/30 dark:border-gray-700/30 mt-auto">
                  <span className={`text-xs ${getNoteStyle(note.color).textClass} opacity-70`}>
                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                  <div className="flex space-x-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full hover:bg-white/30 dark:hover:bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <MoreVertical className={`h-4 w-4 ${getNoteStyle(note.color).textClass}`} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => togglePinNote(note.id)}>
                          <Pin className="h-4 w-4 mr-2" /> Unpin Note
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(note)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit Note
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Note
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Other Notes */}
      <h2 className="text-lg font-medium text-foreground mb-3">Others</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto">
        {otherNotes.map((note) => (
          <Card 
            key={note.id} 
            className={`${getNoteStyle(note.color).bgClass} shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-none rounded-xl overflow-hidden h-auto flex flex-col relative group`}
          >
            <CardHeader className="pb-3 pt-6 px-5">
              <CardTitle className="text-lg leading-tight">
                <span className={`break-words font-semibold ${getNoteStyle(note.color).textClass} line-clamp-2`}>{note.title}</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pb-2 px-5 flex-grow">
              <div className="bg-white/30 dark:bg-black/20 backdrop-blur-sm rounded-lg p-4 min-h-[120px] border border-white/50 dark:border-gray-700/50">
                <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${getNoteStyle(note.color).textClass} line-clamp-8`}>{note.content}</p>
              </div>
            </CardContent>
            
            <CardFooter className="px-5 py-1.5 flex justify-between items-center bg-white/20 dark:bg-black/10 backdrop-blur-sm border-t border-white/30 dark:border-gray-700/30 mt-auto">
              <span className={`text-xs ${getNoteStyle(note.color).textClass} opacity-70`}>
                {new Date(note.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric'
                })}
              </span>
              <div className="flex space-x-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full hover:bg-white/30 dark:hover:bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <MoreVertical className={`h-4 w-4 ${getNoteStyle(note.color).textClass}`} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => togglePinNote(note.id)}>
                      <Pin className="h-4 w-4 mr-2" /> Pin Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(note)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit Note
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Note
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create Note Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter note title"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <Textarea
                id="content"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note content here..."
                rows={5}
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2">
                {colorOptions.map(color => (
                  <Button
                    key={color.value}
                    type="button"
                    className={`h-8 w-8 rounded-full ${color.bgClass} hover:scale-110 transition-transform ${
                      noteColor === color.value ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    onClick={() => setNoteColor(color.value)}
                    variant="ghost"
                  >
                    <span className="sr-only">{color.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                clearForm();
                setIsCreateDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateNote}>Create Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
              <Input
                id="edit-title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter note title"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-content" className="text-sm font-medium">Content</label>
              <Textarea
                id="edit-content"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note content here..."
                rows={5}
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2">
                {colorOptions.map(color => (
                  <Button
                    key={color.value}
                    type="button"
                    className={`h-8 w-8 rounded-full ${color.bgClass} hover:scale-110 transition-transform ${
                      noteColor === color.value ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    onClick={() => setNoteColor(color.value)}
                    variant="ghost"
                  >
                    <span className="sr-only">{color.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                clearForm();
                setIsEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditNote}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

// Initial sticky notes data
const stickyNotes = [
  {
    id: "1",
    title: "Welcome to Sticky Wall!",
    content: "This is your digital sticky note wall. Create, organize, and pin your thoughts, ideas, and reminders here!",
    color: "orange",
    createdAt: new Date().toISOString(),
    isPinned: true
  },
  {
    id: "2",
    title: "Getting Started",
    content: "• Click 'New Note' to create notes\n• Choose from 5 beautiful colors\n• Pin important notes to the top\n• Edit or delete notes anytime",
    color: "yellow",
    createdAt: new Date().toISOString(),
    isPinned: false
  },
  {
    id: "3",
    title: "Pro Tips",
    content: "Use different colors to categorize your notes:\n• Yellow for reminders\n• Green for ideas\n• Blue for tasks\n• Purple for goals",
    color: "green",
    createdAt: new Date().toISOString(),
    isPinned: false
  },
  {
    id: "4",
    title: "Dark Mode Ready",
    content: "All notes automatically adapt to your theme preference. Switch between light and dark mode in Settings!",
    color: "purple",
    createdAt: new Date().toISOString(),
    isPinned: false
  }
];

export default StickyWall;
