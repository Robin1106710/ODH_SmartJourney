import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const simpleItems = ['Item 1', 'Item 2', 'Item 3', 'Item 4']

export default function SimpleDragDrop() {
  const [items, setItems] = useState(simpleItems)

  // Handle drag end
  const handleOnDragEnd = (result: any) => {
    const { destination, source } = result

    if (!destination) return // Dropped outside the list

    if (destination.index === source.index) return // Dropped in the same position

    const updatedItems = Array.from(items)
    const [removedItem] = updatedItems.splice(source.index, 1) // Remove the dragged item
    updatedItems.splice(destination.index, 0, removedItem) // Add the dragged item to the new position

    setItems(updatedItems) // Update the state with the new order
  }

  return (
    <div style={{ padding: '20px' }}>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <ul
              style={{ listStyleType: 'none', padding: 0 }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {items.map((item, index) => (
                <Draggable key={item} draggableId={item} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        margin: '10px 0',
                        padding: '10px',
                        background: 'lightgrey',
                        borderRadius: '5px',
                        ...provided.draggableProps.style, // Ensure styles are applied correctly
                      }}
                    >
                      {item}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder} {/* Placeholder needed for proper layout */}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
