from translator import translate_to_english

queries = [
    "Who are the customers from Chennai?",
    "சென்னையில் உள்ள வாடிக்கையாளர்கள் யார்?",
    "भारत के ग्राहकों की कुल ऑर्डर राशि क्या है?"
]

for q in queries:
    print("Input:", q)
    print("Output:", translate_to_english(q))
    print("-" * 40)