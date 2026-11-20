""" Data Structures is about how data can be stored in different structures. Algorithms are about how to solve different
problems, often by searching through and manipulating data structures. Understanding DSA helps you find the best
combination of Data Structures and Algorithms to create more efficient code. """

# import deque from collection
from collections import deque

# Stack
'''
A stack is a data structure that can hold many elements, and the last element added is the first one to be removed.
Like a pile of pancakes, the pancakes are both added and removed from the top. So when removing a pancake, 
it will always be the last pancake you added. This way of organizing elements is called LIFO: Last In First Out.
Basic operations we can do on a stack are:
    -> Push: Adds a new element on the stack.
    -> Pop: Removes and returns the top element from the stack.
    -> Peek: Returns the top (last) element on the stack.
    -> isEmpty: Checks if the stack is empty.
    -> Size: Finds the number of elements in the stack.
Stacks can be implemented by using arrays or linked lists.
Stacks can be used to implement undo mechanisms, to revert to previous states, 
to create algorithms for depth-first search in graphs, or for backtracking. 
'''
# stack using list using function
stack = []


def stack_implement():
    stack.append(5)
    stack.append(7)
    stack.append('helllo')
    stack.append('how are you')
    print("appended element in stack: ", stack)
    peek = stack[-1]
    print("peek: ", peek)
    stack.pop()
    print("after pop: ", stack)
    stack.pop()
    print("after pop: ", stack)
    if stack == 0:
        print("stack is empty")
    print("size of stack: ", len(stack))


print("\n----:stack using list using function:----\n")
stack_implement()

# stack using importing deque from collection with creating proper class


class stack_implementation:
    def __init__(self):
        self.stack = deque()

    def push(self, ele):
        self.stack.append(ele)

    def peek(self):
        return self.stack[-1]

    def pop(self):
        return self.stack.pop()

    def size(self):
        return len(self.stack)

    def empty(self):
        if self.stack == 0:
            return "stack is empty"
        else:
            return "stack is not empty"


print("\n----:stack using importing deque from collection with creating proper class:----\n")
s = stack_implementation()
s.push(4)
s.push(5)
s.push(8)
s.push(7)
print(f"Show last element: {s.peek()}")
print(f"Remove last element: {s.pop()}")
print(f"Now show last element but we can say 2nd last for understanding: {s.peek()}")
print(f"Show size of stack: {s.size()}")
print(f"Return answer after check stack is empty or not: {s.empty()}")
print("\n\n")
# Queue
'''
Think of a queue as people standing in line in a supermarket.
The first person to stand in line is also the first who can pay and leave the supermarket.
This way of organizing elements is called FIFO: First In First Out.
Basic operations we can do on a queue are:
    -> Enqueue: Adds a new element to the queue.
    -> Dequeue: Removes and returns the first (front) element from the queue.
    -> Peek: Returns the first element in the queue.
    -> isEmpty: Checks if the queue is empty.
    -> Size: Finds the number of elements in the queue.
Queues can be implemented by using arrays or linked lists.
Queues can be used to implement job scheduling for an office printer, order processing for e-tickets, 
or to create algorithms for breadth-first search in graphs.
'''
# queue using list using function
queue = []


def queue_implement():
    queue.insert(0, 5)
    queue.insert(0, 7)
    queue.insert(0, 'helllo')
    queue.insert(0, 'how are you')
    peek = queue[-1]
    print("return first element: ", peek)
    print("insert element in queue: ", queue)
    queue.pop()
    print("after pop: ", queue)
    queue.pop()
    print("after pop: ", queue)
    if queue == 0:
        print("queue is empty")
    print("size of queue: ", len(queue))


print("\n----:queue using list using function:----\n")
queue_implement()
print("\n")

# queue using importing deque from collection with creating proper class


class queue_implementation:
    def __init__(self):
        self.queue = deque()

    def enqueue(self, ele):
        self.queue.appendleft(ele)

    def dequeue(self):
        return self.queue.pop()

    def peek(self):
        return self.queue[-1]

    def size(self):
        return len(self.queue)

    def empty(self):
        if self.queue == 0:
            return "queue is empty"
        else:
            return "queue is not empty"


print("\n----:queue using importing deque from collection with creating proper class:----\n")
q = queue_implementation()
q.enqueue(4)
q.enqueue(5)
q.enqueue(8)
q.enqueue(7)
print(f"show first element: {q.peek()}")
print(f"Remove first element: {q.dequeue()}")
print(f"Show size of queue: {q.size()}")
print(f"Return answer after check queue is empty or not: {q.empty()}")


'''
A Linked List is, as the word implies, a list where the nodes are linked together. Each node contains data and a pointer 
The way they are linked together is that each node points to where in the memory the next node is placed.

There are three basic forms of linked lists:
    -> Singly linked lists:
       A singly linked list is the simplest kind of linked lists. It takes up less space in memory because each node 
       has only one address to the next node.
    
    -> Doubly linked lists:
       A doubly linked list has nodes with addresses to both the previous and the next node, and therefore takes up 
       more memory. But doubly linked lists are good if you want to be able to move both up and down in the list.
        
    -> Circular linked lists:
       A circular linked list is like a singly or doubly linked list with the first node, the "head", 
       and the last node, the "tail", connected.
        
In singly or doubly linked lists, we can find the start and end of a list by just checking if the links are null. 
But for circular linked lists, more complex code is needed to explicitly check for start and end nodes in certain 
applications.
Circular linked lists are good for lists you need to cycle through continuously.

Linked List Operations
Basic things we can do with linked lists are:
    -> Traversal
    -> Remove a node
    -> Insert a node
    -> Sort

Traversal of a Linked List: 
Traversing a linked list means to go through the linked list by following the links from one node to the next. 
Traversal of linked lists is typically done to search for a specific node, and read or modify the node's content, 
remove the node, or insert a node right before or after that node.
To traverse a singly linked list, we start with the first node in the list, the head node, and follow that node's 
next link, and the next node's next link and so on, until the next address is null.
'''


