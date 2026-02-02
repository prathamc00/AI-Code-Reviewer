"""
Test file with intentional issues for the AI Code Reviewer to detect.
This file contains security, performance, and code quality issues.
"""

import os
import pickle

# Security Issue 1: Hardcoded API key
API_KEY = "sk_live_1234567890abcdefghijk"

# Security Issue 2: Hardcoded password
password = "SuperSecret123"

# Security Issue 3: SQL Injection vulnerability
def get_user(username):
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    return query

# Security Issue 4: Use of eval
def calculate(expression):
    result = eval(expression)
    return result

# Security Issue 5: Use of os.system
def run_command(cmd):
    os.system(cmd)

# Performance Issue 1: Nested loops
def process_data(data1, data2, data3):
    results = []
    for item1 in data1:
        for item2 in data2:
            for item3 in data3:
                results.append(item1 + item2 + item3)
    return results

# Performance Issue 2: List append in loop
def build_list(items):
    result = []
    for item in items:
        result.append(item * 2)
    return result

# Performance Issue 3: Blocking call in async function
import asyncio
import time

async def fetch_data():
    time.sleep(5)  # Should use await asyncio.sleep()
    return "data"

# Code Quality Issue 1: Missing docstring
def process_items(items, filter_func, transform_func, limit, offset, sort_key):
    filtered = [item for item in items if filter_func(item)]
    transformed = [transform_func(item) for item in filtered]
    sorted_items = sorted(transformed, key=sort_key)
    return sorted_items[offset:offset + limit]

# Code Quality Issue 2: Single letter variable
def calculate_total(items):
    t = 0
    for a in items:
        t += a
    return t

# Code Quality Issue 3: Very long function (over 50 lines)
def long_function():
    line1 = 1
    line2 = 2
    line3 = 3
    line4 = 4
    line5 = 5
    line6 = 6
    line7 = 7
    line8 = 8
    line9 = 9
    line10 = 10
    line11 = 11
    line12 = 12
    line13 = 13
    line14 = 14
    line15 = 15
    line16 = 16
    line17 = 17
    line18 = 18
    line19 = 19
    line20 = 20
    line21 = 21
    line22 = 22
    line23 = 23
    line24 = 24
    line25 = 25
    line26 = 26
    line27 = 27
    line28 = 28
    line29 = 29
    line30 = 30
    line31 = 31
    line32 = 32
    line33 = 33
    line34 = 34
    line35 = 35
    line36 = 36
    line37 = 37
    line38 = 38
    line39 = 39
    line40 = 40
    line41 = 41
    line42 = 42
    line43 = 43
    line44 = 44
    line45 = 45
    line46 = 46
    line47 = 47
    line48 = 48
    line49 = 49
    line50 = 50
    line51 = 51
    line52 = 52
    return line52

# Code Quality Issue 4: Class without docstring
class UserManager:
    def __init__(self):
        self.users = []
    
    def add_user(self, user):
        self.users.append(user)
