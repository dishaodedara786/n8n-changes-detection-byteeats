import db from '../../models/index.js'
import logger from '../../config/logger.js';

const Wishlist = db.Wishlist;
const FoodItem = db.FoodItem;
const Category = db.Category;

export async function index(req, res) {
    try {
      	const userId = req.session.userId;

		if (!userId) {
			return res.redirect("/login");
		}

		const favItems = await Wishlist.findAll({
			where: { user_id: userId },
			include: [
				{
					model: FoodItem,
					include: [Category],
				},
			],
		});

		const formattedFavItems = favItems.map((item) => {
			return {
				id: item.food_item.id,
				name: item.food_item.name,
				price: item.food_item.price,
				image: item.food_item.image,
				category: item.food_item.category,
				quantity: item.quantity,
			};
		});

		return res.render("portal/wishlist", {
			wishlists: formattedFavItems,
			success_msg:req.session.success_msg,
			error_msg:req.session.error_msg
		});
    } catch (err) {
		logger.error(`Failed to fetch wishlists: ${err}`);
		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";

		return res.render("portal/wishlist", {
			wishlists: [],
			error_msg: "An internal server error occurred. Please try again later.",
		});
    }
};

export async function show(req, res) {
	try {
		const foodId = req.params.id;

		const food = await FoodItem.findOne({
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
	} catch (err) {
		logger.error(`Error while showing food item: ${err}`);

		return res
			.status(500)
			.render("errors/500", { 
				message: "An internal server error occurred. Please try again later." 
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

		const foodItem = await FoodItem.findOne({ where: { id: food_item_id } });
		if (!foodItem) {
			req.session.error_msg = "Food item not found.";

			return res.redirect("/dashboard");
		}

		const existingFav = await Wishlist.findOne({
			where: { user_id: userId, food_item_id },
		});

		if (existingFav) {
			req.session.error_msg = "food item is already in wishlist.";
		} else {
			await Wishlist.create({
				user_id: userId,
				food_item_id,
				created_at: new Date(),
				updated_at: new Date(),
			});
			req.session.success_msg = "Food item successfully added to wishlist.";
		}

		return res.redirect("/dashboard");
	} catch (err) {
		logger.error("Error while adding food item in wishlist:", err);
		req.session.error_msg =
      		"An internal server error occurred. Please try again later.";

		return res.redirect("/dashboard");
	}
};

export async function destroy(req, res) {
    try {
        const id = req.params.id;
        const find = await Wishlist.findOne({ where: { food_item_id:id } });
	
        if (!find) {
            req.session.error_msg = "Food item not found in wishlist.";
            return res.redirect('/dashboard')
        }
        await find.destroy();

        req.session.success_msg = "Food item successfully removed from the wishlist."

		return  res.redirect('/wishlists')
    } catch (err) {
        logger.error(`server error while removing item from cart : ${err}`);

		return res.render("errors/500", {
			message: "An internal server error occurred. Please try again later.",
		});
    }
}