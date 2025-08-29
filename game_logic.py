import random

class Game:
    def __init__(self):
        self.cards = []
        self.flipped_cards = []
        self.current_player = 1
        self.scores = {1: 0, 2: 0}
        self.matched_pairs = 0
        self.can_flip = True

    def reset(self):
        
        images = [
            'img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 
            'img5.jpg', 'img6.jpg', 'img1.jpg', 'img2.jpg', 
            'img3.jpg', 'img4.jpg', 'img5.jpg', 'img6.jpg'
        ]
        random.shuffle(images)
        self.cards = [{'image': img, 'flipped': False, 'matched': False} for img in images]
        self.flipped_cards = []
        self.scores = {1: 0, 2: 0}
        self.matched_pairs = 0
        self.current_player = 1
        self.can_flip = True

    def flip_card(self, card_index, player):
        if self.can_flip and not self.cards[card_index]['flipped'] and not self.cards[card_index]['matched']:
            self.cards[card_index]['flipped'] = True
            self.flipped_cards.append(card_index)

            
            if len(self.flipped_cards) == 2:
                card1, card2 = self.flipped_cards
                if self.cards[card1]['image'] == self.cards[card2]['image']:
                    self.cards[card1]['matched'] = True
                    self.cards[card2]['matched'] = True
                    self.scores[player] += 10
                    self.matched_pairs += 1
                else:
                    self.cards[card1]['flipped'] = False
                    self.cards[card2]['flipped'] = False
                    self.switch_player()

                self.flipped_cards = []
            return self.get_game_state()

    def switch_player(self):
        self.current_player = 2 if self.current_player == 1 else 1

    def get_game_state(self):
        return {
            'cards': self.cards,
            'scores': self.scores,
            'current_player': self.current_player,
            'matched_pairs': self.matched_pairs
        }
