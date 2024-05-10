import geocoder
import json
import os

class CoordinatesGenerator:
    def __init__(self):
        self.filepath = 'city_coordinates.json'
        self.key = "superpeem"
        self.cache = self.load_cache()

    def load_cache(self):
        if os.path.exists(self.filepath) and os.path.getsize(self.filepath) > 0:
            with open(self.filepath, 'r') as file:
                try:
                    return json.load(file)
                except json.JSONDecodeError:
                    return {}
        return {}

    def save_cache(self):
        with open(self.filepath, 'w') as file:
            json.dump(self.cache, file, indent=4)

    def get_coordinates(self, city):
        if city in self.cache:
            #print('hit')
            return self.cache[city]
        else:
            #print('miss')
            coordinates = self.fetch_coordinates_from_geonames(city)
            if coordinates:
                self.cache[city] = coordinates
                self.save_cache()
                return coordinates
            return None

    def fetch_coordinates_from_geonames(self, city):
        g = geocoder.geonames(city, key=self.key)
        return g.latlng