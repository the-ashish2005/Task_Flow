
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// TagType: { name: string, color: "personal" | "work" | "default" | string }
// TagManagementModalProps: { isOpen: boolean, onClose: function, onAddTag: function, onDeleteTag: function, existingTags: TagType[] }

// Color options for tags
const tagColorOptions = [
  { name: "Red", value: "tag-red" },
  { name: "Blue", value: "tag-blue" },
  { name: "Yellow", value: "tag-yellow" },
  { name: "Green", value: "tag-green" },
  { name: "Purple", value: "tag-purple" },
  { name: "Pink", value: "tag-pink" },
  { name: "Indigo", value: "tag-indigo" },
  { name: "Cyan", value: "tag-cyan" },
  { name: "Orange", value: "tag-orange" },
  { name: "Teal", value: "tag-teal" },
];

// Helper function to get tag color CSS
const getTagColorStyle = (colorValue) => {
  // Handle tag-* format (convert to CSS variable)
  if (colorValue.startsWith('tag-')) {
    return { backgroundColor: `var(--${colorValue})` };
  }
  
  // Handle legacy color names
  switch (colorValue) {
    case 'personal': return { backgroundColor: 'var(--tag-red)' };
    case 'work': return { backgroundColor: 'var(--tag-blue)' };
    case 'default': return { backgroundColor: 'var(--tag-yellow)' };
    default: return { backgroundColor: colorValue }; // Direct color value
  }
};

const TagManagementModal = ({ isOpen, onClose, onAddTag, onDeleteTag, existingTags }) => {
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState("tag-blue");
  const [activeTab, setActiveTab] = useState("view");
  
  const handleAddTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    // Check if tag already exists
    if (existingTags.some(tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase())) {
      toast({
        title: "Error",
        description: "Tag with this name already exists",
        variant: "destructive"
      });
      return;
    }
    
    onAddTag(newTagName.trim(), selectedColor);
    setNewTagName("");
    toast({
      title: "Success",
      description: `Tag "${newTagName.trim()}" has been added`,
    });
    // Switch back to view tab after adding
    setActiveTab("view");
  };
  
  const handleDeleteTag = (tagName) => {
    if (["Personal", "Work", "Default"].includes(tagName)) {
      toast({
        title: "Cannot delete default tag",
        description: "Default tags cannot be deleted",
        variant: "destructive"
      });
      return;
    }
    onDeleteTag(tagName);
    toast({
      title: "Success",
      description: `Tag "${tagName}" has been deleted`,
    });
  };

  return (
    <div className="space-y-4 py-2">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="view">View Lists</TabsTrigger>
          <TabsTrigger value="add">Add New List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-4">
          <h3 className="text-sm font-medium">Current Lists</h3>
          <div className="relative h-[300px] w-full border rounded-md">
            <ScrollArea className="h-full w-full p-2">
              <div className="flex flex-col space-y-2 pr-2">
                {existingTags.map((tag) => (
                  <div key={tag.name} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-sm" 
                        style={getTagColorStyle(tag.color)}
                      ></div>
                      <span>{tag.name}</span>
                    </div>
                    {!["Personal", "Work", "Default"].includes(tag.name) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteTag(tag.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => setActiveTab("add")} 
              className="flex items-center gap-1 mt-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Add New List
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="add" className="space-y-4">
          <h3 className="text-sm font-medium">Add New List</h3>
          <div className="flex flex-col space-y-3">
            <Input 
              placeholder="Enter list name" 
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="col-span-3"
            />
            
            <div>
              <p className="text-xs text-muted-foreground mb-2">Select color:</p>
              <div className="flex flex-wrap gap-2">
                {tagColorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className="w-6 h-6 rounded-full border-2"
                    style={{
                      ...getTagColorStyle(color.value),
                      borderColor: selectedColor === color.value ? '#333' : 'transparent'
                    }}
                    onClick={() => setSelectedColor(color.value)}
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setActiveTab("view")}>
                Cancel
              </Button>
              <Button onClick={handleAddTag} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add List
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TagManagementModal;
