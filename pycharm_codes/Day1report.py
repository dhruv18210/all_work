# ------------------------------ Day_1 Python ------------------------------#
# --------------------------------------------------------------------------#

""" Multi-line comments:
introduce
myself
"""
# print multiple variable with commas and '+' operator.
year = 22
a1 = "Hello, "
a2 = "I am Dhruv "
a3 = f"I am {year} years old."
print(a1, a2, a3)
print(a1 + a2 + a3)
print("length of a2 is", len(a2))  # find length of string

# assign variable
a = 10  # integer data type
b = 3.33  # float data type
d = "Welcome"  # string data type
e = 1j  # complex data type

# calculate sum
c = int(a + b)  # assign data type for sum value
print(f"sum is {c}")  # f-string for print statement

# check data type
print(type(a))
print(type(b))
print(type(c))
print(type(d))
print(type(e))

# function to implement global variable
# assign global variable outside the loop
g = "good"


def gfunc():
    global g2  # global variable using global keyword
    g2 = "bad"  # assing value in g2 global variable
    # g = "very good"  # g variable inside function
    # print below statement because g variable declare inside function, so it not take global function
    print("python is", g)
    # print global variable without keyword
    print("python is", g)
    # print global variable with keyword
    print("python is", g2)


# calling gfunc() function
gfunc()

# assign multiple data
name, age, city = "Dhruv", 22, "HMT"
print(f"My name is {name}\nMy Age is {age} years\nI am belongs to {city}")  # escape character for new line \n

# assign multi data into multi variable using list
nums = [20, 50, 60]
i, j, k = nums
print("sum is", i + j + k)

# assign same data in multi variable
o = p = m = "hello"
print(m)

# type casting
n = float(1)
n1 = int(5.2)
n2 = str(10)
print(n, type(n))
print(n1, type(n1))
print(n2, type(n2))

# type conversion
x4 = int(11.25)
x5 = float(10)
x6 = complex(18)
print(x4)
print(x5)
print(x6)

# generate random number
import random
print(random.randrange(-9, 10))

# Python String
para = """ Multiline strings 
are store using
single and double quoets."""

print("store" in para)  # check string using In...
print("stoe" not in para)  # check string using Not In....

if "store" in para:  # check string using IF condition with In...
    print("yes")

if "stoie" not in para:  # check string using IF condition with Not In...
    print("No")

# string functions or methods
txt = "hello!! How\t are you? "
print(txt.upper())  # convert into upper case
print(txt.lower())  # convert into lower case
print(txt.strip())  # remove whitespace from string
print(txt.replace("hello", "hii"))  # replace string or character
print(txt.split(" "))  # split string into substring according to given argument like comma, space
print(txt.capitalize())  # capitalize 1st character of string
print(txt.casefold())  # make string in lower case
print(txt.count("o"))  # returns the number of times a specified value appears in the string
print(txt.center(50))  # align string in center
print(txt.endswith("? "))  # check string end with specific character or special character or space
print(txt.swapcase())  # swap upper to lower case and lower to upper case
print(txt.expandtabs(8))  # tabs specified times in string
print(txt.find("are"))  # give place of specifics word or character from string
# string slicing
print(txt[5])  # get any character from string using index
print(txt[:7])  # string slicing where start to 0th index character until 7th index character
print(txt[5:])  # string slicing where start to 5th index character until last character
print(txt[1:9])  # string slicing between 1st char to 9th char
print(txt[-9:-2])  # string slicing where between 2nd last char to 9th last char

# concatination of string
txt1 = "Welcome"
txt2 = "to home"
print(txt1 + txt2)  # no space between txt1 and txt2 strings
print(txt1 + " " + txt2)  # add space between two strings

# Formate string
price = 26
print(f"Price of that packet is {price}.")  # f-string with placeholder
print(f"Price of that packet is {price:.2f}.")  # display price with 2 decimals
print(f"Price of total 10 packet according to 20 rupees are {20 * 10}.")  # Perform a math operation in placeholder

# ------------------------------ Day_2 Python ------------------------------#
# --------------------------------------------------------------------------#

# Boolean type casting
t = bool("Hello")
print(t)
print(isinstance(t, str))  # check variable is int, str, float, bool, complex


# Arithmetic operator
def arithmetic_operator(v1=20, v2=5):
    print("sum is", v1 + v2)  # add two values
    print("Subtraction is", v1 - v2)  # subtract one value with other value
    print("Multiplication is", v1 * v2)  # multiply one value with other value
    print("Devision is", v1 / v2)  # return float
    print("reminder is", v1 % v2)  # return reminder
    print("Exponential is", v1 ** v2)  # return root value
    print("Floor devision is", v1 // v2)  # return integer


arithmetic_operator()


def assignment_operator(v, v1, v2, v3, v4, v5, v6):
    v += 3
    print("sum:", v)  # add two values
    v1 -= 5
    print("subtraction:", v1)  # subtract one value with other value
    v2 *= 4
    print("multiplication:", v2)  # multiply one value with other value
    v3 /= 2
    print("devision:", v3)  # return float
    v4 %= 3
    print("reminder:", v4)  # return reminder
    v5 **= 5
    print("exponential:", v5)  # return root value
    v6 //= 6
    print("floor devision:", v6)  # return integer


assignment_operator(6, 15, 2, 15, 26, 4, 17)


def comparison_operator(v=5, v1=3, v2=4):
    print("less than:", v < v1)  # less than
    print("greater than:", v > v1)  # greater than
    print("greater than equal to:", v >= v1)  # greater than equal to
    print("less than equal to:", v <= v1)  # less than equal to
    print("equal to:", v == v1)  # equal to
    print("not equal to:", v != v1)  # not equal to
    print(1 < v1 and v2 < v)  # chain comparison operators


comparison_operator()


def logical_operator(z=5, s=4):
    print("Logical operator AND:", z > 3 and s < 5)  # both conditions are true, then return true
    print("Logical operator OR:", z < 3 or s > 5)  # one conditions is true from multi conditions, then return true
    print("Logical operator NOT:", not (z > 3 and s < 5))  # reverse result like result if true, it returns false


logical_operator()

# Ternary operator
num = 6
x = "Fri" if num == 5 else "Sat" if num == 6 else "Sun" if num == 7 else "weekday"  # instead use of elsif we can use ternary opearator in single line of code
print(x)

# identity operator
u = ["a", "b", "c"]
o = ["a", "c"]
p = o
print(p is o)  # check both variables points in same memory. if both variables are in same memory it returns true otherwisee false
print(o is not u)  # check both variables not points in same memory. if both variables are not in same memory it returns true otherwisee false
# Difference between is or '==' below
print(u is o)  # check both variables points in same memory. if both variables are in same memory it returns true otherwisee false
print(u == o)  # check values of both variables are equal or not. if variables values are equal it return true otherwse false
print(u != o)  # check values of both variables are equal or not. if variables values are equal it return true otherwse false

# membership operator
list3 = ["a", "b", "c", "d"]
para = "Hello!, How are you?"
print(para)
print("how" in para)  # check string using In...
print("hello" not in para)  # check string using Not In....
print("c" in list3)  # check from list "c" is present or not
print("a" not in list3)  # reverse bool value

# Bitwise operator   (Bitwise operators are used to compare (binary) numbers)
print("Bitwise AND operator:", 9 & 3)  # sets each bit to 1 if both bits are 1
print("Bitwise OR operator:", 9 | 3)  # Sets each bit to 1 if one of two bits is 1
print("Bitwise XOR operator:", 9 ^ 3)  # Sets each bit to 1 if only one of two bits is 1
print("Bitwise NOT operator:", ~4)  # Inverts all the bits
print("Bitwise Zero fill left shift operator:", 4 << 1)  # Shift left by pushing zeros in from the right and let the leftmost bits fall off
print("Bitwise Signed right shift operator:", 12 >> 2)  # Shift right by pushing copies of the leftmost bit in from the left, and let the rightmost bits fall off

"""
Decimal numbers and their binary values:
-5  1111111111111011
-4  1111111111111100
-3  1111111111111101
-2  1111111111111110
-1  1111111111111111
0 = 0000000000000000
1 = 0000000000000001
2 = 0000000000000010
3 = 0000000000000011
4 = 0000000000000100
5 = 0000000000000101
6 = 0000000000000110
7 = 0000000000000111
8				1000
9               1001
10              1010
11              1011
12              1100
13              1101
14              1110
15			    1111
"""

# Create a List
list1 = ["a", 10, "b", 20, "c", 30, "a", "b"]  # create a list using square bracket '[]'
list2 = list(("a", 20, "b", 30, "c", 50))  # create a list using list constructor with double round-brackets '(())'
print("Create a list using square bracket'[]':", list1)
print("Create a list using list constructor with double round brackets'(())':", list2)
print("size of list using len function:", len(list1))
print("access 4th value from list", list2[3])
print("Indexing to access item from list start to 4th item:", list1[:4])
print("Indexing to access item from list 2nd to last item:", list1[2:])
print("Indexing to access item from list between 4th to 5th item:", list1[4:7])
print("Indexing to access item from list between 2nd last to 6th last item:", list1[-6:-2])

# Check item in or not in list
if 10 in list2:
    print("yes")
else:
    print("No")

list4 = list(("a", 20, "b", 30, "c", 50))
list5 = ["food", "drink"]
tup = tuple(("hand", "eyes"))

# change list items
list4[1:4] = ["a", "hello", "How", "are"]  # change items using indexing
print("change items using indexing:", list4)
list4.append("Phone")  # add item in list
print("add new item in list using append method:", list4)
list4.insert(1, "f")  # in 1st index, 'f' add in list4
print("add items using insert method:", list4)
list4.extend(list5)  # extend list in original list
print("add whole list in original list using extend method:", list4)
list4.extend(tup)  # we can add any iterable object (tuples, sets, dictionaries etc.) using extend method
print("add whole tuple in original list using extend method:", list4)

# remove item from list
list4.remove("a")  # remove specific item from list using remove() method
print("remove 'a' item from list:", list4)
list4.pop(8)  # remove specified index item from list using pop method
print("remove 8th item from list:", list4)
list4.pop()  # remove last item from list using pop method without add any argument or index
print("remove last item from list:", list4)
del list4[6]  # del keyword also use to remove item from list
print("remove 6th item from list:", list4)

list6 = ["time", "money", "important"]
# print("list look before using del keyword without index number:", list6)
del list6  # if user do not add any index, del delete whole list completely
# print(list6)
list7 = ["give", "any", "name"]
print("list look before using clear() method:", list7)
list7.clear()  # clear() method used to clear whole list and when user print that list it shows empty with square bracket '[]'
print("list look after using clear() method:", list7)

# list in loop
testlist = ["banana", "apple", "cherry"]
for i in testlist:
    print("list of fruits using for loop: ", i)

for i in range(len(testlist)):
    print("list of fruits using for loop with range function: ", testlist[i])

i = 0
nextpage = True
while nextpage:
    for ii in range(len(testlist)):
        print("list of fruits: ", testlist[ii])
        nextpage = False
        break
    print("list of fruits using while loop: ", testlist[i])
    i = i + 1
# shorthand for loop
[print("list of fruits using shorthand for loop: ", x) for x in testlist]

# list comprehension

l = ["India", "new Zealand", "australia", "England"]
newlist = []

for x in l:
    if "i" in x:
        newlist.append(x)
print("list of countries which have 'i' in their name:", newlist)

newlist2 = [x for x in l if x != "Australia"]  # shorthand for loop for get countries name without 'australia'
print("return name without australia country:", newlist2)
newlist2_1 = [x for x in l if x == "India"]  # shorthand for loop for get country name 'India'
print("return only India country:", newlist2_1)

newlist3 = [x for x in range(10) if x <= 5]  # returns less than equal to 5 values like 0,1,2,3,4,5
print(newlist3)

newlist4 = [x.find("a") for x in l]  # it returns index of 'a' from each country name
print(newlist4)

newlist5 = [x if x != "New Zealand" else "Afghanistan" for x in l]  # change new zealand to afghanistan
print(newlist5)

l.sort()  # ascending order sorting using sort() method
print("Ascending sorting using sort() method: ", l)

l.sort(reverse=True)  # descending order sorting using sort() method
print("Descending sorting using sort() method: ", l)

l.sort()  # case-insensitive order sorting using sort() method
print("case insensitive sorting using sort() method: ", l)

l.sort(key=str.lower)  # case-insensitive order sorting using sort() method with lower key
print("case insensitive sorting using sort() method with lower key: ", l)

l.reverse()  # reverse order using reverse method()
print("reverse order using reverse method(): ", l)


def my(n):
    return abs(n - 100)


li = [25, 48, 65, 42, 20]
li.sort(key=my)
print("sort according to 'n - 100': ", li)

# copy list
mylist = l.copy()  # copy() used to copy one list to other list
print("Copy one list to another list using copy() method:", mylist)
mylist1 = list(l)  # copy one list to other list using list() method
print("Copy one list to another list using list() method:", mylist1)
mylist2 = l[:2]  # Copy one list to another list using indexing
print("Copy one list to another list using indexing:", mylist2)
lis = l.index("India")  # show index number of particular item stored in list using index() method
print("show index number of particular item stored in list:", lis)

# Tuple
tup1 = ("abc", "bjp", "ced", "abc", "bnp")  # create a tuple using round bracket '()'
tup2 = tuple(("ajp", "bmk", "cjp", "ijp"))  # create a tuple using tuple constructor with double round-brackets '(())'
print(tup1);
print(tup2)
# We can access tuple as like list using indexing and slicing
# to update in tuple, first convert into list and make changes and again convert into tuple
ll = list(tup1)
ll[1] = "jjj"
tup1 = tuple(ll)
print("update tuple:", tup1)

# use append in tuple
lll = list(tup1)
lll.append("kkk")
tup1 = tuple(lll)
print("append item in tuple:", tup1)

# add two tuples using '+' operator
con = tup1 + tup2
print("concatenation of two tuples", con)
# use shorthand operator for adding two tuples
tup3 = ("ajp",)
tup2 += tup3
print("add two tuples using shorthand operator: ", tup2)

# to remove item from tuple, convert into list and remove item and after then convert again into tuple
llll = list(tup1)
llll.remove("jjj")
tup1 = tuple(llll)
print("remove item from tuple:", tup1)

# del keyword for remove whole tuple
# del tup1

# Tuple Unpacking
print(tup2)
(a11, b11, *c11) = tup2
print(a11)    # print 0th index value
print(b11)    # print 1th index value
print(c11)    # print 2nd index to all value

## loop is same like list
## tuple methods
count1 = tup2.count("ajp")
print(count1)  # count same items from list

index1 = tup2.index("cjp")
print(index1)  # get index value of specific item from list

# ------------------------------ Day_3 Python ------------------------------#
# --------------------------------------------------------------------------#

# Set
# Set is just like tuple. Items are not changeable in set. duplicate not allowed. item's order can be change because set is unordered.

se = {"Virat", "Rohit", 25, "Shikhar", "Dhoni", 15, 20}  # create a set using curly brackets '{}'
se1 = set(("Gill", "Jaiswal", "Vaibhav", "Rajat", "Gill", "Rajat"))  # create a set using set constructor with curly brackets '{}'
print(se)
print(se1)
print(len(se1))  # duplicate value not count in set
tt = {True, 1, False, 0}  # True and 1 consider as same value and false and 0 consider as same value#
print(tt)

# Access set item using for loop
for x in se:
    print(x)

print("Virat" in se)

# Add items in set.
se.add("Surya")  # add item using add() method
print(se)

se.update(se1)  # add items or other set in original set using update() method. we can add any iterable object(list, tuple, dict, set).
print(se)

### Remove item from set
se1.remove("Gill")  # remove any item from set using remove() method.
print(se1)
se1.discard("Rajat")  # remove specific item from set using discard() method.
print(se1)
se1.pop()  # remove last item from set using pop() method.
print(se1)
se1.clear()  # remove all items from set using clear() method.
print(se1)
# del se1        # delete whole set using del keyword.

## loop in set
for x in se:
    print(x)

## join one set to other set
bat = {"Gill", "Rohit", "Virat", "Iyer", "Rahul"}
All = {"Hardik", "Axar", "Jadeja"}
bowl = {"Bumrah", "Bhuvi", "Shami"}
sub = {"Siraj", "Washington", "Ishan", "Pant"}

batting_order = bat.union(All)  # we can add single set using union() method and '|' operator
print(batting_order)
playing_11 = bat.union(All, bowl)  # we can add multi set using union() method
print(playing_11)
squad = bat | All | bowl | sub  # we can also add multi set using '|' operator
print(squad)

dup = bat.intersection(se)  # return only duplicates item from both sets to new set
print("Using Intersection() method in new set:", dup)
dup1 = bat & se  # we can also use '&' operator instead of intersection
print("Using '&' operator instead of intersection() method in new set:", dup1)
bat.intersection_update(se)  # return only duplicates item from both sets to existing set
print("Using intersection_update() method to existing set", bat)

bat1 = {"Dhoni", "Pant", "Virat", "Iyer", "Rohit", "Rahul"}
print(se)
print(bat1)
diff = bat1.difference(se)  # return item from 1st set which are not present in 2nd set and create a new set
print("Using difference() method in new set:", diff)
diff1 = bat1 - se  # we can also use '-' operator instead of difference
print("Using '-' operator instead of difference() method in new set:", diff1)
bat1.difference_update(se)  # return item from 1st set which are not present in 2nd set to existing set
print("Using difference_update() method to existing set", bat1)

bat2 = {"Dhoni", "Rajat", 25, 20, 15}
print(se)
print(bat2)
sys_diff = bat2.symmetric_difference(se)  # return not present items from both set and create a new set
print("Using symmetric_difference() method in new set:", sys_diff)
sys_diff1 = bat1 ^ se  # we can also use '^' operator instead of symmetric_difference() method
print("Using '^' operator instead of symmentric_difference() method in new set:", sys_diff1)
bat2.symmetric_difference_update(se)  # return not present items from both set to existing set
print("Using symmentric_difference_update() method to existing set", bat2)

# frozenset
fset = frozenset({"buttler", "jacob", "romario", "archer"})
fset1 = frozenset({"salt", "jacob"})
print(type(fset))
cset = fset.copy()
print("Copy of fset: ", cset)

dset = fset - fset1  # difference between two frozenset
print("difference: ", dset)

iset = fset & fset1  # intersection between two frozenset
print("intersecction", iset)

print("isdisjoint check any intersection between two set and return boool value:", iset.isdisjoint(fset))  # to check any intersection between two frozenset
print("check set is subset of other set using issubset() method:", fset1.issubset(fset))  # check set is subset of other set using issubset() method
print("check set is subset of other set using '<=' operator:", fset1 <= fset)  # check set is subset of other set using '<=' operator
print("check set is subset of other set using '<' operator:", fset1 < fset)  # check set is subset of other set using '<' operator

print("check set is superset of other set using issuperset() method:", fset.issuperset(fset1))  # check set is superset of other set using issuperset() method
print("check set is superset of other set using '>=' operator:", fset >= fset1)  # check set is superset of other set using '>=' operator
print("check set is superset of other set using '>' operator:", fset > fset1)  # check set is superset of other set using '>' operator
sfset = fset1.symmetric_difference(fset)
print("symmentric_difference between two set:", sfset)
print("Union of two sets:", fset | fset1)

# Dictionaries
dict1 = {
    "Name": "Dhruv",
    "City": "HMT",
    "Edcucation": "M.sc IT(Data Science)"
}  # create a dictionary using curly brackets '{}' with key value pair.
print(dict1)
print(dict1["Name"])  # Access age from dictionary using key
print(type(dict1))
print(len(dict1))

dict2 = dict(name="dhruvil", age="23")  # create a dictionary using dict constructor
print(dict2)
print(dict2["age"])  # Access age from dictionary using key
print(type(dict2))
print(len(dict2))

# Access items form dictionary
print(dict2.get('name'))  # access data using get() method by give key name in argument
print(dict2.keys())  # access keys of dictionary using keys() method
dict2["city"] = "meh"  # add city in dict2 by add key and value
print(dict2)
print(dict2.keys())
print(dict2.values())  # access values of dictionary using values() method
dict2["age"] = 25
print(dict2.values())  # access values of dictionary using values() method after change age 23 to 25
print(dict2.items())  # return each item in a dictionary, as tuples in a list
dict2["course"] = "M.sc IT"
print(dict2.items())  # add course in dictionary
print("age" in dict2)  # check key is exist or not
if "meh" in dict2:  # check value using if condition
    print("yes")

dict2.update({"city": "Mehsana"})  # change item in dictionary using update() method
dict2.update({"Hobby": "Travelling"})  # add key value using update() method
print(dict2)
dict1["Name"] = "dhruvpatel"  # change item by key value pair
print(dict1)

# remove item from dictionary
dict2.pop("name")  # remove item using pop() method and give argument as key
print(dict2)

dict2.popitem()  # remove last item from dictionary using popitem() method
print(dict2)

del dict2["age"]  # delete age from dictionary using del keyword
print(dict2)

# dict2.clear()    # remove all items from dictionary using clear() method
# print(dict2)

# del dict2     # delete whole dictionary

# dictionary in loop
for x in dict1:  # return only keys
    print(x)
for x in dict1:  # return only values
    print(dict1[x])
for x in dict1.keys():  # return only keys
    print(x)
for x in dict1.values():  # return only values
    print(x)
for x, y in dict1.items():  # return keys values pair
    print(x, ":", y)

# copy dictionary
cdict = dict2.copy()  # copy one dictionary to other dictionary using copy() method
print(cdict)
cddict = dict(dict1)  # copy one dictionary to other dictionary using dict constructor
print(cddict)

india_squad = {
    "opener": {
        "name": ["Gill", "Rohit", "Ishan"]
    },
    "middle": {
        "name": ["Virat", "Iyer", "Rajat", "Paddikal"]
    },
    "All": {
        "name": ["Jadeja", "Axar", "Hardik"]
    },
}
print(india_squad)
print(india_squad["opener"]["name"])

opener1 = {"Sanju", "Vaibhav", "Abhisek"}
middle1 = {"Ishan", "Tilak", "Rajat"}
all1 = {"Nitish", "Shivam"}
t20_squad = {
    'opener1': opener1,
    'middle1': middle1,
    'all1': all1
}
print(t20_squad)
print(t20_squad["opener1"])

# returns a dictionary with the specified keys and the specified value using fromkeys() method
fkey = {'key1', 'key2', 'key3'}
fkey1 = [0]
ffkey = dict.fromkeys(fkey, fkey1)
print(ffkey)

# match statement
day = 1
match day:
    case 1:
        print("Mon")
    case 2:
        print("Tue")
    case 3:
        print("Wed")
    case 4:
        print("Thu")
    case 5:
        print("Fri")
    case 6:
        print("Sat")
    case _:  # Using '_' as the last case value if you want a code block to execute when there are no other matches
        print("Sun")

day1 = 2
match day:
    case 1 | 2 | 3 | 4 | 5:
        print("Open day")
    case 6 | 7:  # Using '|' as an or operator in the case evaluation to check for more than one value match in one case
        print("weekend")

# while loop
print("break statement:")
inn = 0
while inn < 10:
    print(inn)
    if inn == 5:
        break
    inn += 1

print("continue statement:")
i = 0
while i < 5:
    i += 1
    if i % 2 == 0:
        continue
    print(i)

flist = ["a", "b", "c", "d"]
for x in flist:
    print(x)
    if x == "c":
        break

for x in flist:
    if x == "c":
        continue
    print(x)

for x in range(1, 10, 2):
    print(x)
    if x == 5:
        break

for x in range(1, 10, 2):
    if x == 5:
        continue
    print(x)


# Function with one parameter
def emp(name):
    print(name + " " + "patel")


emp("nirav")


# Function with multi parameter with default parameter
def emp1(fname, lname="suthar"):
    print(fname + " " + lname)


emp1("Nirav", "Patel")
emp1("Mayank")


# Function with keyword parameter
def emp2(name, city):
    print("I am", name + " " + "I am from", city)


emp2(name="Dhaval", city="Vadnagar")


# Function with positional parameter
def emp3(name, age):
    print("I am", name + " " + "my age is", age)


emp3("dvl", 25)


def cal(a, b):
    return a + b


print(cal(10, 25))


# for only positional argument use backslash '/' after function parameter   def a(name,/)
# we can not use any key when call like a(name="fg")
# for only keyword argument use astric '*' before function parameter        def a(*, name)
def arg(*bats):
    print("1st bats", bats[0])
    print("2nd bat", bats)


arg("Virat", "Rohit")


# arbitary *args parameter allows a function to accept any number of positional arguments.
def arg(*args):
    print("1st bats", args[0])
    print("2nd bat", args)


arg("Virat", "Rohit")


# arbitary keyword **kwargs to accept any number of keyword arguments
def keyargs(**kwargs):
    print("1st name:", kwargs["name"])
    print("2nd name:", kwargs)


keyargs(name="dvl", name1="nir")


# ------------------------------ Day_4 Python ------------------------------#
# --------------------------------------------------------------------------#

# decorators
def changecase(func):
    def myinner():
        return func().upper()

    return myinner


@changecase
def myfunction():
    return "Hello Sally"


print(myfunction())

# lamda function
lam = lambda a: a * 2
print(lam(2))


def lamd(n1):
    return lambda v: v + n1


result = lamd(4)
print(result(10))


# recursion

# factorial number
def factorial(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n - 1)


print(factorial(5))


# fibonacci series
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n - 1) + fibonacci(n - 2)


print(fibonacci(7))


# generator
# generator with yield keyword
def cnt(n):
    count = 1
    while count <= n:
        yield count
        count += 1


for num in cnt(5):
    print(num)


# generator with next() method to print value

def my_gen():
    try:
        yield 1
        yield 2
        yield 3
        yield 4
    finally:
        print("gen close")


gen = my_gen()
print(next(gen))  # manually iterate through a generator using the next() function
print(next(gen))
gen.close()  # stops the generator


def gen2():
    while True:
        received = yield
        print(received)


gg = gen2()
next(gg)
gg.send("Hello!!")  # send a value to the generator using send() method
gg.send("How are you?")

# Create a tuple
mytuple = ("apple", "banana", "cherry")
# Create an iterator
myit = iter(mytuple)
# Print the first item
print(next(myit))
print(next(myit))
print(next(myit))

# module
import mym  # using import we can import other py file in this py file and we can call that fuc with mym.greet()
from mym import greet  # using from keyword, we can direct print value by call function from other py file

print(greet("Nirav"))
di = dir(mym)  # dir() function used to see all functions and modules.
print(di)

# python MATH
pm = max(10, 20, 5)  # return maximum number
pm2 = min(10, 20, 5)  # return minimum number
pm3 = pow(5, 3)  # return the value of 5 to the power of 3
pm4 = abs(-96)  # return positive number
print(pm)
print(pm2)
print(pm3)
print(pm4)

# importing math to acceess math functions
import math

pm5 = math.sqrt(25)  # return square root of 25 value
pm6 = math.ceil(2.1)  # rounds a number upwards to its nearest integer
pm7 = math.floor(2.99)  # rounds a number downwards to its nearest integer
pm8 = math.pi  # return pi value
print(pm5)
print(pm6)
print(pm7)
print(pm8)

# convert into json format
import json

jdata = '{ "name":"John", "age":30, "city":"New York"}'
jcon = json.loads(jdata)  # convert into json format using loads() method
print(jcon["age"])

pdict = {"name": "John", "age": 30, "city": "New York"}
jconp = json.dumps(pdict)  # convert python object into json format using dumps() method
jconp1 = json.dumps(pdict, indent=5)  # indent parameter is used to set indentation
jconp2 = json.dumps(pdict, indent=5, separators=(". ", " = "))  # separators parameter is used to separate data
jconp3 = json.dumps(pdict, indent=5, sort_keys=True)  # to check if the result should be sorted or not
print(jconp)
print("Using Indent parameters: ", jconp1)
print("Separators parameter: ", jconp2)
print("Sort_keys parameter: ", jconp3)

# regular expression (RegEX)
# RegEx, or Regular Expression, is a sequence of characters that forms a search pattern.
# RegEx can be used to check if a string contains the specified search pattern.
import re

retxt = "The rain in Spain"
recheck = re.search("^The.*Spain$", retxt)  # The search() function searches the string for a match,
spac = re.search("\s", retxt)  # and returns a Match object if there is a match.
print("space located at: ", spac.start())
if recheck:
    print("String Match")
else:
    print("String not Match")

fre = re.findall("in", retxt)  # The findall() function returns a list containing all matches.
print(fre)
sp = re.split("\s", retxt)  # The split() function returns a list where the string has been split at each match
print(sp)
sp1 = re.split("\s", retxt, 1)  # Split the string only at the first occurrence
print(sp1)

# sub() function
sp2 = re.sub("\s", ", ", retxt,1)  # The sub() function replaces the matches with the text of your choice also replace by your choicee to give number of replacement
print(sp2)

# The Match object has properties and methods used to retrieve information about the search, and the result
sp3 = re.search(r"\bS\w+", retxt)
print(sp3.span())  # Print the position (start- and end-position) of the first match occurrence.
sp4 = re.search(r"\bS\w+", retxt)
print(sp4.string)  # Print the string passed into the function
sp5 = re.search(r"\bS\w+", retxt)
print(sp5.group())  # Print the part of the string where there was a match.

# try, except, else, finally
try:  # The try block lets you test a block of code for errors.
    print("Hello")
except:  # The except block lets you handle the error.
    print("Something went wrong")
else:  # The else block lets you execute code when there is no error.
    print("Nothing went wrong")
# finally block
try:
    print(xfvsfv)
except:
    print("other Something went wrong")
finally:  # The 'finally' block lets you execute code, regardless of the result of the try- and except blocks.
    print("other The 'try except' is finished")

# raise keyword
# Raise an error and stop the program if xy is lower than 0 using raise keyword
xy = -1
if xy < 0:
    raise Exception("Sorry, no numbers below zero")

xyz = "hello"
if not type(xyz) is int:
    raise TypeError("Only integers are allowed")
