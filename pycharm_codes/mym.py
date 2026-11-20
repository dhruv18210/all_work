def greet(name):
    print("Hello, How are you?", name)


import datetime

mydate = datetime.datetime.now()
print(mydate)
print(mydate.year)  # for year
print(mydate.strftime('%a'))  # %a for getting Weekday, short version
print(mydate.strftime('%A'))  # %A for getting Weekday, full version
print(mydate.strftime('%w'))  # %w for getting Weekday as a number 0-6, 0 is Sunday
print(mydate.strftime('%d'))  # %d for getting Day of month 01-31
print(mydate.strftime('%b'))  # %b for getting Month name, short version
print(mydate.strftime('%B'))  # %B for getting Month name, full version
print(mydate.strftime('%m'))  # %m for getting Month as a number 01-12
print(mydate.strftime('%y'))  # %y for getting Year, short version, without century
print(mydate.strftime('%Y'))  # %Y for getting Year, full version
print(mydate.strftime('%H'))  # %H for getting Hour 00-23
print(mydate.strftime('%I'))  # %I for getting Hour 00-12
print(mydate.strftime('%p'))  # %p for getting AM/PM
print(mydate.strftime('%M'))  # %M for getting Minute 00-59
print(mydate.strftime('%S'))  # %S for getting Second 00-59
print(mydate.strftime('%f'))  # %f for getting Microsecond 000000-999999
print(mydate.strftime('%z'))  # %z for getting UTC offset
print(mydate.strftime('%Z'))  # %Z for getting Timezone
print(mydate.strftime('%j'))  # %j for getting Day number of year 001-366
print(mydate.strftime('%U'))  # %U for getting Week number of year, Sunday as the first day of week, 00-53
print(mydate.strftime('%W'))  # %W for getting Week number of year, Monday as the first day of week, 00-53
print(mydate.strftime('%c'))  # %c for getting Local version of date and time
print(mydate.strftime('%C'))  # %C for getting Century
print(mydate.strftime('%x'))  # %x for getting Local version of date
print(mydate.strftime('%X'))  # %X for getting Local version of time
print(mydate.strftime('%%'))  # %% for getting A % character
print(mydate.strftime('%G'))  # %G for getting ISO 8601 year
print(mydate.strftime('%u'))  # %u for getting ISO 8601 weekday (1-7)
print(mydate.strftime('%V'))  # %V for getting ISO 8601 week number (01-53)

'''
# stopwatch
num = 0
start = 0
end = 59

while num == start:
    print("Stopwatch start")
    while num <= end:
        num += 1
        if num == 50:
            break
        print(num)
'''
# None
xyzz = None
print("type of xyzz is:", type(xyzz))

# User input
name1 = input("Enter your name:")
print("My name is", name1)


# ------------------------------ Day_5 Python ------------------------------#
# --------------------------------------------------------------------------#

# Oops concept with python
# generate class and use __init__ method
# The __init__() method is used to assign values to object properties, or to perform operations that are necessary when the object is being created.
# The __init__() method is called automatically every time the class is being used to create a new object.
# we can also add default parameter and multiple parameter
# It does not have to be named self, you can call it whatever you like, but it has to be the first parameter of any method in the class
class myclass:
    def __init__(self, name, age):  # Without self, Python would not know which object's properties you want to access
        self.name = name  # The self parameter links the method to the specific object
        print("Greatest batsman over all time:", name)
        self.age = age
        print(f"age of {name} is:", age)


call_class = myclass("Virat Kohli", 35)  # create an object and call it
call_class = myclass("Rohit Sharma", 39)
call_class.age = 45  # update age to 45
call_class.name = "Gill"  # update name to gill
print("updated age is", call_class.age)
del call_class.age  # delete age property
print("New gen best batsmam", call_class.name)


# we can add other method using self
class Person:
    def __init__(self, name):
        self.name = name

    def greet(self):
        print("Hello and Good morning!, ", self.name)
        return "Hello!!, " + self.name

    def welcome(self):
        message = self.greet()
        print(message + "! Welcome to our website.")


p1 = Person("Dhruv")
p1.welcome()


# class with class property
class Person:
    species = "Human"  # Class property

    def __init__(self, name):
        self.name = name  # Instance property


t1 = Person("Nir")
t2 = Person("Dvl")
t1.age = 35  # add new age property
print("add age in t1 obj: ", t1.age)
print("first name:", t1.name)
print("second name:", t2.name)
print("class property with t1 obj:", t1.species)
print("class property with t2 obj:", t2.species)


class str_method:
    def __init__(self, name, city):
        self.name = name
        self.city = city

    # The __str__() method is a special method that controls what is returned when the object is printed
    def __str__(self):
        return f"name is {self.name}, city is {self.city}"


str_obj = str_method("virat", "HMT")
print(str_obj)
str_obj.city = "Delhi"
print(str_obj)

# Inheritance
'''Inheritance allows us to define a class that inherits all the methods and properties from another class.
Parent class is the class being inherited from, also called base class.
Child class is the class that inherits from another class, also called derived class.'''


class Person:
    def __init__(self, fname, lname):
        self.firstname = fname
        self.lastname = lname

    def printname(self):
        # print(self.firstname, self.lastname)
        pass


class Student(Person):  # child class
    def __init__(self, fname, lname, year):
        super().__init__(fname, lname)  # get all methods from parents class
        # Person.__init__(fname, lname)          # inherit child class from parent class
        self.graduationyear = year  # add year in child class

    def welcome(self):  # other method in child class
        print("Welcome", self.firstname, self.lastname, "to the class of", self.graduationyear)


x = Student("Mike", "Olsen", 2019)
print(x.welcome())

# ------------------------------ Day_6 Python ------------------------------#
# --------------------------------------------------------------------------#

# Polymorphism
'''The word "polymorphism" means "many forms", and in programming 
it refers to methods/functions/operators with the same name that can be executed on many objects or classes.
Polymorphism is often used in Class methods, where we can have multiple classes with the same method name.'''


class india_A:
    def __init__(self, batsman_A, bowler_A, all_round_A):
        self.batsman_A = batsman_A
        self.bowler_A = bowler_A
        self.all_round_A = all_round_A

    def chang(self):  # polymorphism method
        print("Tilak")


class bestscorer_A(india_A):
    def __int__(self, batsman_A):
        self.batsman_A = batsman_A

    def chang(self):  # polymorphism method
        print("Vaibhav")


class bestbowler_A(india_A):
    def __int__(self, bowler_A):
        self.bowler_A = bowler_A

    def chang(self):  # polymorphism method
        print("Arshad")


ind = india_A("Arya", "Anshul", "Nishant")
bats = bestscorer_A("Ayush", "Ruturaj", "Shreyansh")
bowl = bestbowler_A("Yash", "Anukul", "Vipraj")

for x in (ind, bats, bowl):
    print(x.batsman_A)
    print(x.bowler_A)
    print(x.all_round_A)
    print(x.chang())


# inherit class polymorphism
class india:
    def __init__(self, batsman, bowler, all_round):
        self.batsman = batsman
        self.bowler = bowler
        self.all_round = all_round

    def changes(self):
        print("Virat Kohli")


class bestscorer(india):
    def changes(self):
        print("Rohit Sharma")


class bestbowler(india):
    def changes(self):
        print("Jusprit Bumrah")


ind = india("Gill", "Bhuvi", "Hardik")
bats = bestscorer("Gill", "siraj", "NK reddy")
bowl = bestbowler("shikhar", "shami", "Washington")

for x in (ind, bats, bowl):
    print(x.batsman)
    print(x.bowler)
    print(x.all_round)
    print(x.changes())

# Encapsulation
'''Encapsulation is about protecting data inside a class.
It means keeping data (properties) and methods together in a class, while controlling how the data can be accessed from outside the class.
This prevents accidental changes to your data and hides the internal details of how your class works.
Encapsulation provides several benefits:
# Data Protection: Prevents accidental modification of data
# Validation: You can validate data before setting it
# Flexibility: Internal implementation can change without affecting external code
# Control: You have full control over how data is accessed and modified
'''


# In Python, you can make properties private by using a double underscore __ prefix

# private access modifier access parent class with create other method called get method
# private methods cannot be called directly from outside the class
class People:
    def __init__(self, fn, ln, age):
        self.__fn = fn
        self.__ln = ln
        self.__age = age  # age is private property

    def print_age(self):  # for calling private property
        return f"name is: {self.__fn} {self.__ln}, Age is {self.__age}"


peop = People("dvl", "aus", 23)
print(peop.print_age())


# protected access modifier access by derived class
class People1:
    def __init__(self, fn1, ln1, age1):
        self._fn1 = fn1  # fn1 is protected property
        self._ln1 = ln1  # ln1 is protected property
        self._age1 = age1  # age1 is protected property


class student1(People1):
    def __init__(self, fn1, ln1, age1):
        super().__init__(fn1, ln1, age1)

    def print_age(self):  # for calling protected property
        return f"name is: {self._fn1} {self._ln1}, Age is {self._age1}"


peop1 = student1("nir", "USA", 24)
print(peop1.print_age())

# File handling

file = open('sample.txt')  # open is used to open file
print(f"read sample.txt file using open() function: \n{file.read()}")  # read is used to read fle which is opened

with open('sample.txt') as t11:  # with open is used to open file. we can give alis for call that file using as.
    # print(t.read(5))  # we can also capture text using what we get by specify number of char we return.
    print(
        f"1st line from sample.txt file using with open() method: {t11.readline()}")  # You can return one line by using the readline() method
    print(f"2nd line from sample.txt file using with open() method: {t11.readline()}")
    t11.close()
with open('sample.txt', 'a') as ta:  # 'a' - Append - will append to the end of the file
    print(ta.write("\nPython is very important"))

with open('sample.txt') as ta:  # with open is used to open file. we can give alis for call that file using as.
    print(f"appended sample.txt file: \n{ta.read()}")

with open("demofile.txt", 'w') as f:  # 'w' - Write - will overwrite any existing content
    print(f.write("Woops! I have deleted the content!.....\nsorry\nsorry"))

# open and read the file after the overwriting:
with open("demofile.txt") as f:
    print(f"overwrite demofile.txt: \n{f.read()}")
'''
with open("myfile.txt", 'x') as f13:  # first of all create a myfile.txt using 'x'
    with open("myfile.txt", 'a') as f13:  # append txt in myfile.txt using 'a'
        print(f13.write("hello how are u?"))  # write txt in myfile.txt using write() function

with open("myfile.txt") as f13:  # open myfile.txt again
    print(f"read myfile.txt: \n{f13.read()}")  # read myfile.txt to see txt is added or not.

import os

if os.path.exists('myfile.txt'):  # find file using path
    os.remove('myfile.txt')  # remove myfile.txt
else:
    print("file doesnot found")

os.rmdir('dhruvvvvprac')  # used to remove folder
'''
