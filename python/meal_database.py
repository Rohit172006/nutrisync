import random
from datetime import datetime

meal_types = ["breakfast", "lunch", "dinner"]

breakfast_meals = [
"Oatmeal Bowl","Banana Pancakes","Egg Omelette","Avocado Toast","Greek Yogurt Bowl",
"Berry Smoothie","Peanut Butter Toast","Chia Pudding","Apple Cinnamon Oats",
"Protein Pancakes","Vegetable Omelette","Granola Yogurt","Muesli Bowl",
"Spinach Egg Wrap","Almond Oatmeal"
]

lunch_meals = [
"Grilled Chicken Salad","Quinoa Veg Bowl","Turkey Sandwich","Chicken Rice Bowl",
"Tofu Buddha Bowl","Veggie Wrap","Shrimp Rice Plate","Chicken Caesar Salad",
"Lentil Veg Bowl","Salmon Grain Bowl","Beef Burrito Bowl","Veggie Pasta",
"Paneer Salad","Chickpea Bowl","Grilled Fish Plate"
]

dinner_meals = [
"Grilled Salmon","Chicken Stir Fry","Lentil Curry","Tofu Veg Bowl",
"Chicken Sweet Potato","Baked Cod","Turkey Meatballs","Paneer Curry",
"Beef Veg Bowl","Chickpea Spinach Stew","Veggie Fried Rice",
"Grilled Chicken Quinoa","Mushroom Pasta","Vegetable Curry","Fish Veg Plate"
]

tags = ["high_protein","muscle_gain","recovery","anti_inflammatory","energy"]
allergens = [None,"milk","egg","fish","soy","wheat","peanut"]

def generate_meal(name, meal_type):
    calories = random.randint(300,650)
    protein = round(random.uniform(12,50),1)
    carbs = round(random.uniform(20,70),1)
    fat = round(random.uniform(5,30),1)
    fiber = round(random.uniform(2,12),1)
    sodium = random.randint(150,450)

    tag = random.choice(tags)
    allergen = random.choice(allergens)

    allergen_sql = "NULL" if allergen is None else f"'{allergen}'"

    return f"('{name}','{meal_type}',{calories},{protein},{carbs},{fat},{fiber},{sodium},'all','{tag}',{allergen_sql},NOW(),NOW())"

rows = []

for i in range(100):
    rows.append(generate_meal(random.choice(breakfast_meals),"breakfast"))

for i in range(100):
    rows.append(generate_meal(random.choice(lunch_meals),"lunch"))

for i in range(100):
    rows.append(generate_meal(random.choice(dinner_meals),"dinner"))

sql = "INSERT INTO Meals (meal_name, meal_type, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg, season, tag, allergen, createdAt, updatedAt)\nVALUES\n"
sql += ",\n".join(rows) + ";"

with open("meals_300.sql","w") as f:
    f.write(sql)

print("SQL file generated: meals_300.sql")