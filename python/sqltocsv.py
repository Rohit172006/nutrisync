import mysql.connector
import pandas as pd

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="yashoooo",
    database="nutrisyncai"
)

query = "SELECT * FROM meals"

df = pd.read_sql(query, conn)

df.to_csv("meals.csv", index=False)

print("CSV file created")