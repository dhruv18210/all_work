# Part A
"""1. Sum of Two Numbers
Problem Statement: Write a Python program that takes two integers as input and prints their sum.
Sample Input: 5 10
Sample Output: 15"""


def sum_of_two_num():
    a = float(input("enter value of a: "))
    b = float(input("enter value of b: "))
    print(f"sum of two numbers are: {a + b}")


'''2. Even or Odd
Problem Statement: Write a program to check whether a given number is even or odd. 
Sample Input: 7 
Sample Output: Odd'''


def odd_even():
    num = float(input("enter number to check odd or even: "))
    if num % 2 == 0:
        print(f"number {num} is even")
    else:
        print(f"number {num} is odd")


'''3. Factorial of a Number 
Problem Statement: Write a program to find the factorial of a given non-negative integer. 
Sample Input: 5 
Sample Output: 120'''


def factorial():
    num = int(input("enter number to get factorial: "))
    fact = 1
    for i in range(1, num + 1):
        fact = fact * i
        print(fact)


'''4. Reverse a String 
Problem Statement: Write a program that reverses a given string. 
Sample Input: hello 
Sample Output: olleh '''


def reverse_str():
    txt = str(input("enter string: "))
    print(f"Reversed string is: {txt[::-1]}")


'''5. Palindrome Check Problem Statement: Write a program to check whether a given string is a palindrome (reads the 
same forwards and backwards). Sample Input: madam Sample Output: Palindrome'''


def palindrome_or_not():
    txt = str(input("Enter string too check palindrome or not: "))
    if txt[::-1] == txt:
        print(f"Given txt is palindrome: {txt}")
    else:
        print(f"Given txt in not palindrome: {txt}")


'''6. Largest of Three Numbers 
Problem Statement: Write a program to find the largest among three given numbers. 
Sample Input: 4 9 6 
Sample Output: 9'''


def large_of_three():
    a = float(input("Enter value of a: "))
    b = float(input("Enter value of b: "))
    c = float(input("Enter value of c: "))
    if a > b and a > c:
        print(f"large number of given three number is: {a}")
    elif b > c and b > a:
        print(f"large number of given three number is: {b}")
    else:
        print(f"large number of given three number is: {c}")


'''7. Count Vowels in a String 
Problem Statement: Write a program to count the number of vowels (a, e, i, o, u) in a given string. 
Sample Input: hello world 
Sample Output: 3 '''


def count_vowels():
    txt = str(input("Enter string to count vowels appear in string: "))
    vowels = ['a', 'A', 'e', 'E', 'i', 'I', 'o', 'O', 'u', 'U']
    count = 0
    for i in txt:
        if i in vowels:
            count += 1
    print(f"count of vowels from given string is: {count}")


'''8. Find the Maximum in a List Problem Statement: Write a program to find the maximum element in a list of numbers 
without using the built-in max() function. Sample Input: [3, 7, 2, 9, 4] Sample Output: 9'''


def max_from_list():
    numbers = [int(x) for x in input("enter numbers in list: ").split(" ")]
    list1 = list(numbers)
    print(list1)
    num = list1[0]
    for i in list1:
        if i > num:
            num = i
    print(f"max num is {num}")


'''9. Sum of List Elements 
Problem Statement: Write a program to calculate the sum of all elements in a list. 
Sample Input: [1, 2, 3, 4, 5] 
Sample Output: 15 '''


def sum_of_list():
    numbers = [int(x) for x in input("enter element: ").split(" ")]
    list2 = list(numbers)
    print(list2)
    total = 0
    for i in list2:
        total = total + i
    print(f"Sum of all elements is: {total}")


'''10. FizzBuzz Problem Statement: Write a program that prints numbers from 1 to n. For multiples of 3 print 'Fizz', 
for multiples of 5 print 'Buzz', and for multiples of both print 'FizzBuzz'. Sample Input: 15 Sample Output: 1 2 Fizz 
4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz'''


def fizzbuzz():
    n = int(input("enter number for fizzbuzz: "))
    for i in range(1, n):
        if i % 3 == 0 and i % 5 == 0:
            print("fizzbuzz")
        elif i % 3 == 0:
            print("fizz")
        elif i % 5 == 0:
            print("buzz")
        else:
            print(i)


# Part B
'''1. Prime Number Check 
Problem Statement: Write a function is_prime(n) that returns True if n is a prime number, and False otherwise. 
Sample Input: is_prime(29) 
Sample Output: True '''


def is_prime():
    n = int(input("enter number for check prime or not: "))
    if n <= 1:
        print(False)
        return
    for i in range(2, n):
        if n % i == 0:
            print(False)
            return
    print(True)


'''2. Remove Duplicates Preserving Order Problem Statement: Write a program to remove duplicate elements from a list 
while preserving the original order of first occurrence. Sample Input: [1, 2, 2, 3, 4, 4, 5] Sample Output: [1, 2, 3, 
4, 5]'''


def remove_duplicate():
    l1 = [int(x) for x in input("enter element: ").split(" ")]
    print(f"Duplicate list: {l1}")
    se = set(l1)
    l2 = list(se)
    print(f"list without duplicate elements and in ascending order: {l2}")


'''3. Word Frequency Counter 
Problem Statement: Write a program that takes a sentence and returns a dictionary showing the frequency of each word. 
Sample Input: "the quick fox the quick fox jumps" 
Sample Output: {'the': 2, 'quick': 2, 'fox': 2, 'jumps': 1} '''


def word_freq_count():
    txt = input("enter sentence: ")
    txt1 = txt.split()
    dict_word = {}
    for i in txt1:
        if i in dict_word:
            dict_word[i] += 1
        else:
            dict_word[i] = 1
    print(f"a dictionary showing the frequency of each word: \n{dict_word}")


'''4. Second Largest Number in a List 
Problem Statement: Write a program to find the second largest number in a list without using sort(). 
Sample Input: [10, 5, 8, 20, 15] 
Sample Output: 15'''


def second_high_num():
    list1 = [int(x) for x in input("enter elements for find 2nd high number from list: ").split(" ")]
    print(list1)
    large = max(list1)
    minimum = min(list1)
    for num in list1:
        if num != large and num > minimum:
            minimum = num
    if minimum == min(list1):
        print("No second highest number found (all elements same).")
    else:
        print("Second highest number is:", minimum)


'''5. Matrix Transpose 
Problem Statement: Write a program to find the transpose of a given 2D matrix (list of lists). 
Sample Input: [[1, 2, 3], [4, 5, 6]] 
Sample Output: [[1, 4], [2, 5], [3, 6]]'''


def matrix_Transpose():
    matrix = [[1, 2, 3], [4, 5, 6]]
    rows = len(matrix)
    cols = len(matrix[0])
    print(f"Matrix size is {rows} * {cols}")
    transpose_matrix = []
    for j in range(cols):
        new_row = []
        for i in range(rows):
            new_row.append(matrix[i][j])
        transpose_matrix.append(new_row)
    print(transpose_matrix)


# Part C
'''1. Stack Implementation using OOP Problem Statement: Implement a Stack class with methods push(item), pop(), 
and peek(). pop() should raise an exception if the stack is empty. Sample Input: s = Stack(); s.push(1); s.push(2); 
s.pop(); s.peek() Sample Output: 1'''


class stack_oops:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if len(self.items) == 0:
            raise Exception("Stack is empty!")  # raise error if empty
        print(f"removed item is {self.items.pop()}")

    def peek(self):
        if len(self.items) == 0:
            raise Exception("Stack is empty!")  # raise error if empty
        print(f"see the items {self.items[-1]}")


print("----:program 16:----")
s = stack_oops()
s.push(1)
s.push(2)
s.pop()
s.peek()

'''2. Word Count from a File Problem Statement: Write a program that reads a text file and prints the total number of 
words and the count of each unique word. Sample Input: sample.txt containing: 'python is fun and python is easy' 
Sample Output: Total words: 7 {'python': 2, 'is': 2, 'fun': 1, 'and': 1, 'easy': 1}'''


def word_count_file():
    with open('sample.txt', 'r') as file:
        txt = file.read()
    txt1 = txt.split()
    dict_word = {}
    for i in txt1:
        if i in dict_word:
            dict_word[i] += 1
        else:
            dict_word[i] = 1
    print(f"a dictionary showing the frequency of each word: \n{dict_word}")


'''3. Custom Exception for Age Validation Problem Statement: Create a custom exception class InvalidAgeError. Write a 
function set_age(age) that raises this exception if age is negative or greater than 120. Sample Input: set_age(-5) 
Sample Output: InvalidAgeError: Age must be between 0 and 120'''


class InvalidAgeError(Exception):
    pass


def set_age(age):
    if age < 0 or age > 120:
        raise InvalidAgeError("Age must be between 0 and 120")
    else:
        print("Age set to", age)


print("\n----:program 18:----")
call = InvalidAgeError()
set_age(45)

'''4. Bank Account Class Problem Statement: Implement a BankAccount class with deposit(amount) and withdraw(amount) 
methods. withdraw() should raise a custom exception InsufficientBalanceError if the withdrawal amount exceeds the 
available balance. Sample Input: acc = BankAccount(1000); acc.withdraw(1500) Sample Output: InsufficientBalanceError: 
Insufficient balance for this withdrawal'''


class InsufficientBalanceError(Exception):
    pass


class BankAccount:
    def __init__(self, bal=0):
        self.bal = bal

    def deposit(self, amm):
        self.bal += amm
        print(f"deposit amount is {amm} new bal {self.bal}")

    def withdraw_bal(self, amm):
        if amm > self.bal:
            raise InsufficientBalanceError("InsufficientBalanceError:Insufficient balance for this withdrawal")
        else:
            self.bal -= amm
            print(f"withdraw bal is {amm} new bal {self.bal}")


print("\n----:program 19:----")
acc = BankAccount()
acc.deposit(15000)
acc.withdraw_bal(5845)

'''5. Find All Primes in a Range 
Problem Statement: Write a function get_primes(start, end) that returns a list of all prime numbers
within the given range (inclusive) using a helper function and list comprehension. 
Sample Input: get_primes(10, 30) 
Sample Output: [11, 13, 17, 19, 23, 29]'''


def is_prime_not(n):
    if n <= 1:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True


is_prime_not(100)


def get_primes(start, end):
    prime_nums = []
    for i in range(start, end + 1):
        if is_prime_not(i):
            prime_nums.append(i)
    return prime_nums


print("\n----:program 20:----")
print(get_primes(0, 100))

while True:
    print("\n----Practice All Programs----")
    print("1. sum_of_two_num")
    print("2. odd_even")
    print("3. factorial")
    print("4. reverse_str")
    print("5. palindrome_or_not")
    print("6. large_of_three")
    print("7. count_vowels")
    print("8. max_from_list")
    print("9. sum_of_list")
    print("10. fizzbuzz")
    print("11. is_prime")
    print("12. remove_duplicate")
    print("13. word_freq_count")
    print("14. second_high_num")
    print("15. matrix_Transpose")
    print("17. word_count_file")
    print("0. exit the program")
    user = input("enter choice: ")
    if user == "1":
        sum_of_two_num()
    elif user == "2":
        odd_even()
    elif user == "3":
        factorial()
    elif user == "4":
        reverse_str()
    elif user == "5":
        palindrome_or_not()
    elif user == "6":
        large_of_three()
    elif user == "7":
        count_vowels()
    elif user == "8":
        max_from_list()
    elif user == "9":
        sum_of_list()
    elif user == "10":
        fizzbuzz()
    elif user == "11":
        is_prime()
    elif user == "12":
        remove_duplicate()
    elif user == "13":
        word_freq_count()
    elif user == "14":
        second_high_num()
    elif user == "15":
        matrix_Transpose()
    elif user == "17":
        word_count_file()
    elif user == "0":
        print("Exiting program...")
        break
    else:
        print("Invalid choice! Try again.")
