from flask import Flask, render_template, jsonify, request
from game_logic import Game

app = Flask(__name__)

# Inicializa o jogo
game = Game()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start_game', methods=['GET'])
def start_game():
    global game
    game.reset()
    return jsonify(game.get_game_state())

@app.route('/flip_card', methods=['POST'])
def flip_card():
    card_index = request.json.get('card_index')
    player = request.json.get('player')
    result = game.flip_card(card_index, player)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
