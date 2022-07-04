
This is a simple shopping cart demo made by React, Node/Express and Postgres.

Run it by 
```
docker-compose up --build
```

Then visit http://localhost:3050

Note: 

1. The orders can only be made between 10 am and 10 pm.
2. The shopping cart is cached to the sessionStorage so it is stored per tab.
3. The order will be saved to the postgres database.
4. After the order is submitted, it will then display the orders that were made before.
5. Refresh the page will reload the shopping cart.
6. Bootsstrap is used to style the components.

