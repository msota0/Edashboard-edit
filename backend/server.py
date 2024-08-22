from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from flask_cors import CORS, cross_origin


app = Flask(__name__)
CORS(app, resources={r"/data": {"origins": "http://localhost:5173"}})  

mapping_options = {
    '1': 'Book Title',
    '2': 'First Author',
    '3': 'Discipline'
}
subjects = ['African American Studies', 'African Studies', 'Agriculture', 'American Indian Studies', 'American Studies',
    'Anthropology', 'Aquatic Sciences', 'Archaeology', 'Architecture & Architectural History',
    'Architecture and Architectural History', 'Art & Art History', 'Asian Studies', 'Astronomy', 'Bibliography',
    'Biological Sciences', 'Botany & Plant Sciences', 'British Studies', 'Business', 'Chemistry',
    'Classical Studies', 'Communication Studies', 'Computer Science', 'Criminology & Criminal Justice',
    'Cultural Studies', 'Development Studies', 'Developmental & Cell Biology', 'Ecology & Evolutionary Biology',
    'Economics', 'Education', 'Engineering', 'Environmental Science', 'Environmental Studies', 'European Studies',
    'Feminist & Women\'s Studies', 'Film Studies', 'Finance', 'Folklore', 'Food Studies', 'Garden & Landscape',
    'Gender Studies', 'General Science', 'Geography', 'Geology', 'Health Policy', 'Health Sciences', 'History',
    'History of Science & Technology', 'Horticulture', 'International Relations', 'Irish Studies', 'Jewish Studies',
    'Labor & Employment Relations', 'Language & Literature', 'Latin American Studies', 'Law', 'Library Science',
    'Linguistics', 'Management & Organizational Behavior', 'Marketing & Advertising', 'Mathematics',
    'Middle East Studies', 'Military Studies', 'Museum Studies', 'Music', 'Paleontology', 'Peace & Conflict Studies',
    'Performing Arts', 'Philosophy', 'Physics', 'Political Science', 'Population Studies', 'Psychology',
    'Public Health', 'Public Policy & Administration', 'Religion', 'Science & Technology Studies', 'Slavic Studies',
    'Social Work', 'Sociology', 'Statistics', 'Technology', 'Transportation Studies', 'Urban Studies', 'Zoology',
    'gardland-discipline', 'horticulture-discipline']
subject_set = set()
for subject in subjects:
    subject_lower = subject.lower()
    subject_set.add(subject_lower)

# @lru_cache(maxsize=None)
def load_excel_data():
    # Load Excel file into a DataFrame
    file_path = r'C:\Users\MDsota\Desktop\dashboard\backend\complete_list.xlsx'
    df = pd.read_excel(file_path, sheet_name='Sheet1')  

    # Rename columns to match your keys
    df = df.rename(columns={
        'ebook ISBN without hyphens': 'ISBN',
        'publication_title': 'Book Title',
        'first_author': 'First Author',
        'discipline': 'Discipline',
        'publisher_name': 'Publisher',
        'copyright_year': 'Copyright Year',
        'title_url' : 'title_url', 
        'class_level': 'Class Level',
        'available': 'Available'
        
    })
    for subject in subjects:
        df[subject.lower()] = 0

# Update values based on the 'Discipline' field using vectorized operations
    for subject in subjects:
        df[subject.lower()] = df['Discipline'].str.contains(subject, na=False).astype(int)

    print('Loaded Excel as DataFrame with additional subject columns')
    return df


df = load_excel_data() 

@cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
@app.route('/data', methods=['POST'])
def handle_data():
    data = request.json  # Extract JSON data from request body
    # optionNumber = data.get('number')
    inputValue = data.get('input') 
    print(inputValue)
    # selectedSubject = data.get('selectedSubject') if optionNumber == '3' else None
    # selectedVal = data.get('selectedVal')

    # Perform query based on option number
    queried_data = query_excel(df, inputValue, subject_set)

    # Prepare response data
    response_data = {
        'message': 'Data received successfully',
        # 'optionNumber': optionNumber,
        # 'selectedVal': selectedVal,
        'inputValue': inputValue,
        # 'selectedSubject': selectedSubject,
        'data': queried_data  # Include queried data in the response
    }

    # print(queried_data)

    return jsonify(queried_data)


def query_excel(df, inputVal, subject_set):
    # column_name = mapping_options.get(option)
    print('check',inputVal, type(inputVal))

    inputVal_lower = inputVal.lower()
    inputVal_lower = inputVal_lower.strip()
    # Perform case-insensitive search
    filtered_df1 = df[df['Book Title'].astype(str).str.lower().str.contains(inputVal_lower, na=False)]
    filtered_df2 = df[df['First Author'].astype(str).str.lower().str.contains(inputVal_lower, na=False)]
    # selectedSubject_edit = inputVal_lower
    result_data = pd.concat([filtered_df1, filtered_df2]).drop_duplicates().reset_index(drop=True)
    # output_df = result_data[['Book Title', 'First Author', 'Discipline', 'Publisher', 'Copyright Year', 'title_url', 'Class Level', 'Available']]
    if inputVal_lower in subject_set:
        filtered_df3 = df[df[inputVal_lower] == 1]
        result_data = pd.concat([result_data, filtered_df3]).drop_duplicates().reset_index(drop=True)
        # output_df = result_data[['Book Title', 'First Author', 'Discipline', 'Publisher', 'Copyright Year', 'title_url', 'Class Level', 'Available']]
    # result_data_interim = pd.concat([filtered_df1, filtered_df2]).drop_duplicates().reset_index(drop=True)
    
        
        # Extract relevant columns
        # result_data = filtered_df[['Book Title', 'First Author', 'Discipline', 'Publisher', 'Copyright Year', 'title_url', 'Class Level', 'Available']]

    
    # Sort result_data by 'Copyright Year' in descending order
    result_data_sorted = result_data.sort_values(by='Copyright Year', ascending=False)
    
    # Convert sorted result_data to dictionary format
    result_data_dict = result_data_sorted.to_dict(orient='records')
    
    return result_data_dict

@cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
@app.route('/query', methods=['POST'])
def new_query():
    data = request.json
    start_year = int(data.get('startYear', 0))
    end_year = int(data.get('endYear', float('inf')))
    available = data.get('available')
    class_level = data.get('classLevel')
    option = data.get('option')
    inputVal = data.get('input')
    subject = data.get('subject')
    
    # Filter DataFrame based on request parameters
    filtered_df = df[(df['Copyright Year'] >= start_year) & (df['Copyright Year'] <= end_year)]
    
    if available == 'available':
        filtered_df = filtered_df[filtered_df['Available'] == 'Y']
    elif available == 'unavailable':
        filtered_df = filtered_df[filtered_df['Available'] == 'N']
    
    if class_level == '1':
        filtered_df = filtered_df[filtered_df['Class Level'] == 'UG']
    elif class_level == '2':
        filtered_df = filtered_df[filtered_df['Class Level'] == 'G']

    # Convert DataFrame to dictionary format
    result_data = filtered_df.to_dict(orient='records')
    
    return jsonify(result_data)


if __name__ == '__main__':
    app.run(port=5173)
