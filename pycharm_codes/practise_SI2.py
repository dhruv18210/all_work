
import time
# stopwatch
num = 0
start = 0
end = 59

while num == start:
    print("Stopwatch start")
    while num <= end:
        num += 1
        time.sleep(1)
        if num == 10:
            break
        print(num)
