# main-project-team61
# Tradient -- About Us



# Change directory 
git clone https://github.com/CS222-UIUC/main-project-team61.git
cd main-project-team61

# Create a virtual environment
```
python3.11 -m venv .venv
```
### You may need to install that version of python
```
brew install python@3.11
```
### Activate on macOS and Linux:
```
source .venv/bin/activate
```
# Install dependencies, this will take a minute
```
pip install -r requirements.txt
```

# Create a .env file in frontend folder .env (copy api keys from google slides)

# Create another .env file in the main project folder (same copy and paste from google slides)


### Start the Django server 
```
# start another terminal and run, and make sure .venv is activated
cd system
python manage.py runserver 8001
```

### Start the frontend
```
# have a seperate terminal for the frontend
cd frontend
npm install
npm run start
```
