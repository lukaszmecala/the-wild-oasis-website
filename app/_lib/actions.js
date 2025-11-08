"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import {
  createBooking,
  deleteBooking,
  getBookings,
  updateBooking,
  updateGuest,
} from "./data-service";
import { redirect } from "next/navigation";

export async function updateGusetProfile(dataForm) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in to update profile");

  const nationalID = dataForm.get("nationalID");
  const [nationality, countryFlag] = dataForm.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) {
    throw new Error(
      "Invalid national ID number. It should be 6-12 alphanumeric characters."
    );
  }
  const updateData = {
    nationalID,
    nationality,
    countryFlag,
  };

  await updateGuest(session.user.guestId, updateData);

  revalidatePath("/account/profile");
}
export async function createReservation(bookingData, dataForm) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in to create reservation");

  const newReservation = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: parseInt(dataForm.get("numGuests")),
    observations: dataForm.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: dataForm.get("hasBreakfast") === "on" ? true : false,
    status: "unconfirmed",
  };
  await createBooking(newReservation);
  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}

export async function updateReservation(dataForm) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in to update reservation");

  const bookingId = dataForm.get("bookingId");
  const numGuests = parseInt(dataForm.get("numGuests"));
  const observations = dataForm.get("observations").slice(0, 500);

  const guestBookings = await getBookings(session.user.guestId);
  const bookingIds = guestBookings.map((b) => b.id);

  if (!bookingIds.includes(Number(bookingId)))
    throw new Error("You can only update your own reservations");

  await updateBooking(bookingId, {
    numGuests,
    observations,
  });
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");
  redirect(`/account/reservations`);
}

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session)
    throw new Error("You must be logged in to delete a reservation");

  const guestBookings = await getBookings(session.user.guestId);
  const bookingIds = guestBookings.map((b) => b.id);
  if (!bookingIds.includes(bookingId))
    throw new Error("You can only delete your own reservations");

  await deleteBooking(bookingId);

  revalidatePath("/account/reservations");
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutUser() {
  await signOut({ redirectTo: "/" });
}
