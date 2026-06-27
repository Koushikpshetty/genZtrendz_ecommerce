import { z } from "zod";

export const productValidationSchema = z.object({
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title must be a string",
    })
    .min(1, "Title cannot be empty"),

  price: z.string({
    required_error: "Price is required",
    invalid_type_error: "Price must be a number",
  }),

  discountedPrice: z
    .string({
      invalid_type_error: "Discounted price must be a number",
    })
    .optional(),

  rating: z
    .string({
      invalid_type_error: "Rating must be a number",
    })
    .optional(),

  company: z.string(),

  category: z
    .string({
      required_error: "Category is required",
      invalid_type_error: "Category must be a string",
    })
    .min(1, "Category cannot be empty"),

  size: z.array(z.string()).optional(),

  isFeatured: z.string().default(false).optional(),
});

// Utility function to validate request body
export const validateProductData = (data) => {
  return productValidationSchema.parse(data);
};

// Utility function for safe parsing (returns success/error)
export const safeValidateProductData = (data) => {
  return productValidationSchema.safeParse(data);
};
