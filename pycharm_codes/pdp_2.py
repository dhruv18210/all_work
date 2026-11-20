# Linear search

def linear_search(a, t):
    for i in range(len(a)):
        for j in range(i + 1, len(a)):
            s = a[i] + a[j]
            if s == t:
                return a[i], a[j]


a = [2, 50, 0, 3, 4, 10, 3, 4]
t = 50
result = linear_search(a, t)
if result:
    print(f"Elements of total: {result}")
else:
    print(f"Elements not found!!!")


# Binary Search


def two_sum(arr, target):
    arr.sort()
    for i in range(len(arr)):
        low, high = i + 1, len(arr) - 1
        while low <= high:
            mid = (low + high) // 2
            if arr[mid] == target - arr[i]:
                return arr[i], arr[mid]
            elif arr[mid] < target - arr[i]:
                low = mid + 1
            else:
                high = mid - 1
    return None


arr = [2, 3, 4, 10, 44, 40]
target = 50
result2 = two_sum(arr, target)
if result2:
    print(f"Elements of total: {result2}")
else:
    print(f"Elements not found!!!")
