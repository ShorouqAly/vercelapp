import streamlit as st
import datetime

st.set_page_config(page_title="ExclusiveWire - Upload Announcement", layout="centered")
st.title("📰 Upload Your Exclusive Announcement")

# Step 1: Announcement details
st.header("Step 1: Announcement Info")
title = st.text_input("Announcement Title")
summary = st.text_area("Brief Summary (for journalists)", height=100)
content = st.text_area("Full Announcement (under embargo)", height=200)
uploaded_files = st.file_uploader("Upload any files (PDF, images, docs)", accept_multiple_files=True)

# Step 2: Writing Support Option
st.header("Step 2: Writing Support (Optional)")
writing_help = st.radio(
    "Would you like writing assistance?",
    ("No", "AI-generated draft", "Human-edited", "Full service"),
    horizontal=True
)

# Step 3: Tags and Beats
st.header("Step 3: Tag Your Announcement")
industry_tags = st.multiselect("Select Industries", ["Tech", "Health", "Finance", "Consumer Goods", "Legal", "Education", "Energy"])
beat_tags = st.multiselect("Select Journalist Beats", ["Funding", "Product Launch", "Executive Hire", "Report Release", "Partnership", "Trend Analysis"])

# Step 4: Embargo and Pricing
st.header("Step 4: Embargo & Fee")
embargo_date = st.date_input("Embargo Lift Date", min_value=datetime.date.today())
embargo_time = st.time_input("Embargo Lift Time", value=datetime.time(8, 0))
tier = st.selectbox("Select Announcement Tier", ["Basic - $99", "Boosted - $199", "Premium - $399"])
custom_targeting = st.checkbox("Would you like to target specific outlets?")

# Step 5: Final Review
st.header("Step 5: Review & Submit")
if st.button("Submit Announcement"):
    embargo_datetime = datetime.datetime.combine(embargo_date, embargo_time)
    st.success("✅ Announcement submitted successfully!")
    st.info(f"Embargo set for: {embargo_datetime}")
    st.write("Writing Help Requested:", writing_help)
    st.write("Industries:", industry_tags)
    st.write("Beats:", beat_tags)
    st.write("Tier Selected:", tier)
    if custom_targeting:
        st.warning("Targeting feature will be available in the next release.")

# Footer
st.markdown("---")
st.caption("ExclusiveWire MVP - Module 1 | Built by Nova")
