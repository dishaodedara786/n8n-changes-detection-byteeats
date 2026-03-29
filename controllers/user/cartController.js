import db from '../../models/index.js'
import logger from '../../config/logger.js';

const Cart = db.Cart;
const foodItems = db.FoodItem;
const Category = db.Category;

export async function index(req, res) {
    try {
        const userId = req.session.userId; 

        if (!userId) {
            return res.redirect("/login");
        }

        const cartItems = await Cart.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: foodItems,
                    include: [Category],
                },
            ],
        });

        const formattedCartItems = cartItems.map((item) => {
            return {
                food: {
                    id: item.food_item.id,
                    name: item.food_item.name,
                    price: item.food_item.price,
                    image: item.food_item.image,
                    category: item.food_item.category,
                },
                quantity: item.quantity,
            };
        });

        const totalAmount = formattedCartItems.reduce((sum, item) => {
            return sum + item.food.price * item.quantity;
        }, 0);

        return res.render("portal/cart", {
            cartItems: formattedCartItems,
            totalAmount,
            success_msg:req.session.success_msg,
            error_msg:req.session.error_msg
        });
    } catch (err) {
        logger.error(`Failed to fetch cart items: ${err}`);

        return res.render("portal/cart", {
            cartItems: [],
            totalAmount: 0,
            error_msg: "Failed to fetch cart items.",
        });
    }
};

export async function store(req, res) {
    try {
        const userId = req.session.userId;
        const food_item_id = req.params.id;

        if (!userId) {
            req.session.error_msg = "Please logged in first.";

            return res.redirect("/login");
        }

        const foodItem = await foodItems.findOne({ where: { id: food_item_id } });
        if (!foodItem) {
            req.session.error_msg = "Food item not found.";

            return res.redirect("/dashboard");
        }

        const ExistInCart = await Cart.findOne({
            where: { user_id: userId, food_item_id },
        });

        if (ExistInCart) {
            req.session.error_msg= "Food item already in cart.";

            return res.redirect('/dashboard');
        }

        await Cart.create({
            user_id: userId,
            food_item_id,
            quantity: 1,
            price: foodItem.price,
            created_at: new Date(),
            updated_at: new Date()
        });

        req.session.success_msg = "Food item successfully added to cart.";

        return res.redirect("/dashboard");
    } catch (err) {
        logger.error(`Error while adding food item in a cart: ${err}`);
        req.session.error_msg =
            "An internal server error occurred. Please try again later.";

        return res.redirect("/dashboard");
    }
};

export async function show(req, res) {
    try {
        const foodId = req.params.id;
        const food = await foodItems.findOne({
            where: { id: foodId },
            include: [Category],
        });

        if (!food) {
            return res.status(404).render("errors/404", { message: "Food item not found." });
        }

        return res
            .render("portal/food-detail", { 
                food,
                success_msg:req.session.success_msg,
                error_msg:req.session.error_msg
            });
    } catch (error) {
        logger.error("Error while showing food item:", error);

        return res
            .status(500)
            .render("errors/500", {
                message:
                "An internal server error occurred. Please try again later.",
            });
    }
};

export async function update(req, res) {
    const { id } = req.params; 
    const { action } = req.body; 

    try {
        const cartItem = await Cart.findOne({ where: { food_item_id: id } });

        if (!cartItem) {
            return res.status(404).send('Food item not found in cart.');
        }

        cartItem.quantity = parseInt(cartItem.quantity);
        
        if (action === 'increase') {
            cartItem.quantity += 1;
        } else if (action === 'decrease' && cartItem.quantity > 1) {
            cartItem.quantity -= 1;
        }

        await cartItem.save();
    
        return  res.redirect('/cart')
    } catch (err) {
        logger.error(`Error while updating food item from cart: ${err}`);

        return res.render("errors/500", {
            message: "An internal server error occurred. Please try again later.",
        });
    }
};

export async function destroy(req, res) {
    try {
        const id = req.params.id;
        const find = await Cart.findOne({ where: { food_item_id:id } });

        if (!find) {
            req.session.error_msg = "Food item not found in cart.";

            return res.redirect('/dashboard')
        }
        await find.destroy();

        req.session.success_msg = "Food item successfully removed from the cart."

        return res.redirect('/cart')
    } catch (err) {
        logger.error(`Error while removing food item from cart: ${err}`);

        return res.render("errors/500", {
            message: "An internal server error occurred. Please try again later.",
        });
    }
}