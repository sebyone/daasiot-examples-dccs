#!/usr/bin/env python3
# example file we use to generate device models
'''
{
	"name". "ESP32",
	"description": "ESP32",
	"device_group": {
		"title": "ESP32 DIY Modules",
		"description": "ESP32 DIY Modules",
		"link_image": "https://ce8dc832c.cloudimg.io/v7/_cdn_/BE/B6/90/00/0/617451_1.jpg?width=640&height=480&wat=1&wat_url=_tme-wrk_%2Ftme_new.png&wat_scale=100p&ci_sign=ecbc082e1968d44612ae5635e6defb9c957a3da9"
	},
	"resources": [
		{
			"name": "cover",
			"link": "https://m.media-amazon.com/images/I/71D4E5DS-qL.jpg",
			"resource_type": 1
		},
		{
			"name": "datasheet",
			"link": "https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf",
			"resource_type": 2
		},
		{
			"name": "hardware design guidelines",
			"link": "https://www.espressif.com/sites/default/files/documentation/esp32_hardware_design_guidelines_en.pdf",
			"resource_type": 2
		},
		{
			"name": "programming guide",
			"link": "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/index.html",
			"resource_type": 1
		}
	],
	"functions": [
		{
			"name": "PID1",
			"parameters": [
				{
					"name": "P",
					"data_type": 1
				},
				{
					"name": "I",
					"data_type": 1
				},
				{
					"name": "D",
					"data_type": 1
				},
				{
					"name": "Frequenza",
					"data_type": 1
				},
				{
					"name": "Timeout",
					"data_type": 1
				}
			],
			"inputs": [
				{
					"name": "target",
					"data_type": 1
				},
				{
					"name": "corrente",
					"data_type": 1
				}
			],
			"outputs": [
				{
					"name": "pilota",
					"data_type": 1
				}
			]
		},
		{
			"name": "PLN1",
			"parameters": [
				{
					"name": "ix",
					"data_type": 1
				},
				{
					"name": "week-day",
					"data_type": 1
				},
				{
					"name": "time",
					"data_type": 1
				},
				{
					"name": "pilota",
					"data_type": 1
				}
			],
			"outputs": [
				{
					"name": "pilota",
					"data_type": 1
				}
			]
		}
	]
}
'''

import sys
import requests
import json
import random
from tqdm import tqdm
from faker import Faker

def generate_name():
	fruits = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry', 'strawberry', 'tangerine', 'ugli', 'watermelon']

	return f"{random.choice(fruits)}-{random.randint(1, 10000):04d}"

def generate_description():
	fake = Faker()
	return fake.sentence()

def get_image_link():
	# devices images
	image_links = [
		"https://ce8dc832c.cloudimg.io/v7/_cdn_/BE/B6/90/00/0/617451_1.jpg?width=640&height=480&wat=1&wat_url=_tme-wrk_%2Ftme_new.png&wat_scale=100p&ci_sign=ecbc082e1968d44612ae5635e6defb9c957a3da9",
		"https://m.media-amazon.com/images/I/71D4E5DS-qL.jpg",
		"https://neuroons.com/wp-content/uploads/2022/03/luigi-frunzio-nLS8r16NCiM-unsplash-1024x768.jpg",
		"https://i.pinimg.com/236x/3f/4a/c2/3f4ac2dae461ecf43f2c4eaf4babd167.jpg",
		"https://i.pinimg.com/736x/ef/8d/59/ef8d595cf44d8b09c1c7a74266e4ea75.jpg",
		"https://i.imgur.com/JuufyRR.jpeg",
		"https://i.imgur.com/l8yZpoD.jpeg",
		"https://m.media-amazon.com/images/I/81x37vNZyVL._AC_UF1000,1000_QL80_.jpg",
		"https://m.media-amazon.com/images/I/715lLPSw2GL.jpg",
		"https://m.media-amazon.com/images/I/61lgoKLm6KL._AC_UF1000,1000_QL80_.jpg",
		"https://www.royalcircuits.com/wp-content/uploads/2021/02/raspberry-pi-1-700x627.jpg",
	]

	return random.choice(image_links)
	

def get_documentation():
	# datasheets
	datasheet_links = [
		("https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf", "datasheet"),
		("https://www.espressif.com/sites/default/files/documentation/esp32_hardware_design_guidelines_en.pdf", "hardware design guidelines"),
		("https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/index.html", "programming guide"),
		("https://www.espressif.com/sites/default/files/documentation/esp32_technical_reference_manual_en.pdf", "technical reference manual"),
		("https://docs.arduino.cc/hardware/uno-rev3/", "Arduino Uno Rev3"),
		("https://docs.arduino.cc/hardware/uno-r4-minima/", "Arduino Uno R4 Minima"),
		("https://docs.arduino.cc/hardware/micro/", "Arduino Micro"),
		("https://docs.arduino.cc/hardware/zero/", "Arduino Zero"),
		("https://docs.arduino.cc/hardware/motor-shield-rev3/", "Arduino Motor Shield Rev3"),
	]

	return random.choice(datasheet_links)

def generate_device_group():

	title_choices_1 = ['fast', 'quick', 'speedy', 'rapid', 'swift', 'brisk', 'prompt', 'express', 'fleet', 'nimble', 'spry', 'agile', 'lively', 'active', 'vigorous', 'brisk', 'animated', 'sprightly', 'zippy', 'peppy', 'perky', 'chipper', 'bright', 'bouncy']

	title_choices_2 = ['device', 'module', 'component', 'part', 'element', 'unit', 'piece', 'segment', 'section', 'portion', 'bit', 'fragment']

	return {
		"title": f"{random.choice(title_choices_1)}-{random.choice(title_choices_2)}",
		"description": generate_description(),
		"link_image": get_image_link()
	}

def generate_function():
	fake = Faker()
	func = {
		"name": fake.word(),
		"properties": [],
	}

	for i in range(random.randint(1, 6)):
		p = {
			"name": fake.word(),
			"data_type": random.randint(1, 3),
			"property_type": random.randint(1, 4),
		}

		rand_res = random.randint(1, 10)
		if rand_res > 5:
			p["default_value"] = str(random.randint(1, 100))
			if rand_res > 8:
				p["safe_value"] = str(random.randint(1, 100))

		func["properties"].append(p)

	return func


def generate_device_model():
	dev_mod = {
		"name": generate_name(),
		"description": generate_description(),
		"device_group": generate_device_group(),
		"resources": [],
		"functions": []
	}

	# add resources
	for i in range(random.randint(1, 4)):
		link, name = get_documentation()
		dev_mod["resources"].append({
			"name": name,
			"link": link,
			"resource_type": 2
		})
	
	# add image
	dev_mod["resources"].append({
		"name": "cover",
		"link": get_image_link(),
		"resource_type": 4
	})

	# add functions
	for i in range(random.randint(1, 4)):
		func = generate_function()

		dev_mod["functions"].append(func)


	return dev_mod


def main():

	n = 100
	if len(sys.argv) > 1:
		n = int(sys.argv[1])

	host = "localhost:3000"

	if len(sys.argv) > 2:
		host = sys.argv[2]

	endpoint = f"http://{host}/api/device_models"



	for i in tqdm(range(n)):
		dev_mod = generate_device_model()
		r = requests.post(endpoint, json=dev_mod)
		# print while showing progress
		print(i, r.status_code, dev_mod["name"], sep="\t")




if __name__ == "__main__":
	main()
