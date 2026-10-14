from elevenlabs.client import ElevenLabs

API_KEY = "sk_60bd79515c039cbe29691dd0631b3011d51a6162d8094643"
client = ElevenLabs(api_key=API_KEY)

text = input("Type something: ")

# ✅ NEW SDK METHOD
audio = client.text_to_speech.convert(
    voice_id="EXAVITQu4vr4xnSDxMaL",   # Rachel (female)
    model_id="eleven_multilingual_v2",
    text=text
)
print(speak)
# audio is bytes generator → save as mp3
with open("output.mp3", "wb") as f:
    for chunk in audio:
        f.write(chunk)

print("✅ Saved output.mp3 (play it)")
