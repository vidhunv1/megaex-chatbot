import { User } from 'models'

export const keyboardMenu = (user: User) => {
  return [
    [{ text: user.__('menu_wallet') }, { text: user.__('menu_buy_sell') }],
    [{ text: user.__('menu_my_account') }, { text: user.__('menu_info') }]
  ]
}
