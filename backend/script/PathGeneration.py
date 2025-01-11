import pandas as pd
import os

location_data_path = "../data/locations.csv"
distance_matrix_path ="../data/distance_matrix.csv"

# change the working directory to file location if needed
abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

# read csv
locations_data = pd.read_csv(location_data_path)
distance_matrix_data = pd.read_csv(distance_matrix_path,index_col=0)

class generation_input:
    def __init__(self, historial:bool , shopping:bool , literature_art:bool ,
                    family:bool , educational:bool,nature:bool,entertainment:bool,
                     romantic:bool,relaxation:bool ,start_point_ID:int,
                    time_limit:int):
        self.historial = historial
        self.shopping = shopping
        self.literature_art = literature_art
        self.family = family
        self.educational = educational
        self.nature = nature
        self.entertainment = entertainment
        self.romantic = romantic
        self.relaxation = relaxation
        self.start_point_ID = start_point_ID
        self.time_limit =time_limit

#---------------------------------data cleansing-----------------------

def generate_path(input:generation_input):
    filtered_df = location_filiter(input)
    filtered_loc_ID = filtered_df["ID"].tolist()

    loc_weights= filtered_df["estimated_time"].tolist()

    filtered_distance_matrix = distance_matrix_filiter(filtered_loc_ID)
    temp = filtered_distance_matrix.map(lambda x: convert_to_minutes(x) if isinstance(x, str)   else x)
    temp =temp.values

    start_index = filtered_loc_ID.index(input.start_point_ID)

    time_limit = input.time_limit

    max_nodes, best_path =max_nodes_within_weight(temp,start_index,weight_limit=time_limit,node_weights=loc_weights)
    
    for x in best_path:
        id = filtered_loc_ID[x]
        print(locations_data.loc[locations_data['ID'] == id, 'tc_name'].values[0])

def location_filiter(input: generation_input):
    result  = None
    if input.historial:
        filtered_df = locations_data[  locations_data['historial'] == True]
        result = pd.concat([result, filtered_df])

    if input.shopping:
        filtered_df = locations_data[  locations_data['shopping'] == True]
        result = pd.concat([result, filtered_df])

    if input.literature_art:
        filtered_df = locations_data[  locations_data['literature_art'] == True]
        result = pd.concat([result, filtered_df])

    if input.family:
        filtered_df = locations_data[  locations_data['family'] == True]
        result = pd.concat([result, filtered_df])
    
    if input.educational:
        filtered_df = locations_data[  locations_data['educational'] == True]
        result = pd.concat([result, filtered_df])

    if input.nature:
        filtered_df = locations_data[  locations_data['nature'] == True]
        result = pd.concat([result, filtered_df])

    if input.entertainment:
        filtered_df = locations_data[  locations_data['entertainment'] == True]
        result = pd.concat([result, filtered_df])

    if input.romantic:
        filtered_df = locations_data[  locations_data['romantic'] == True]
        result = pd.concat([result, filtered_df])

    if input.relaxation:
        filtered_df = locations_data[  locations_data['relaxation'] == True]
        result = pd.concat([result, filtered_df])

    start_point_row=locations_data.loc[locations_data['ID'] == input.start_point_ID]
    result = pd.concat([result, start_point_row])
    
    result =result.drop_duplicates()

    return result.sort_values(by='ID')

def distance_matrix_filiter(filiter_ID):

    result=distance_matrix_data

    for x in range(1,locations_data.shape[0]+1):
        if x not in filiter_ID:
            result =result.drop(x)
            result =result.drop(columns=[str(x)])

    return result

def convert_to_minutes(time_str):
    if 'min' not in time_str:
        return 1000 
    parts = time_str.split()
    if 'hours' in time_str or 'hour' in time_str:
        hours = int(parts[0])
        minutes = int(parts[2])
        total_minutes = hours * 60 + minutes
    else:
        total_minutes = int(parts[0])
    return total_minutes

#---------------------------------path finding algo----------------------------

def max_nodes_within_weight(matrix, start, weight_limit, node_weights):
    n = len(matrix)  # Number of nodes
    stack = [(start, node_weights[start], [start])]  # (node, cumulative weight, path)
    max_nodes = 0
    best_path = []

    while stack:
        node, current_weight, path = stack.pop()

        if current_weight > weight_limit:
            continue

        if len(path) > max_nodes:
            max_nodes = len(path)
            best_path = path

        for neighbor in range(n):
            if matrix[node][neighbor] > 0 and neighbor not in path:
                new_weight = current_weight + matrix[node][neighbor] + node_weights[neighbor]
                if new_weight <= weight_limit:
                    stack.append((neighbor, new_weight, path + [neighbor]))

    return max_nodes, best_path

if __name__ == "__main__":
    input= generation_input(True,False,False,False,True, True,False,True,False,32,100)
    generate_path(input)