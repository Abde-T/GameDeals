import icons from "@/constants/icons";
import images from "@/constants/images";
import { deleteGame, fetchFavoriteGames, getUserId } from "@/lib/appwrite";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FavoriteGame {
  $id: string;
  title: string;
  thumb: string;
}
const favorites = () => {
  const [favoriteGames, setFavoriteGames] = useState<FavoriteGame[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const userId = await getUserId();
      const games = await fetchFavoriteGames(userId!);

      setFavoriteGames(games);
    };

    loadFavorites();
  }, []);

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  const handleDeletePress = async (gameId: string) => {
    const confirmation = await Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this game from your favorites?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteGame(gameId);
              const userId = await getUserId();

              const updatedGames = await fetchFavoriteGames(userId!);
              setFavoriteGames(updatedGames);
              console.log("Game deleted successfully and favorites updated.");
            } catch (error) {
              console.error("Error deleting game:", error);
              Alert.alert("Error", "Failed to delete game. Please try again.");
            }
          },
        },
      ]
    );
  };
  return (
    <SafeAreaView className="h-full bg-[#242424]">
      <ScrollView className="p-5">
        <Text className="text-xl font-rubik-bold text-green-300 mb-4">
          Favorite Games
        </Text>
        {favoriteGames.length === 0 ? (
          <Text className="text-lg text-white">No favorites found!</Text>
        ) : (
          favoriteGames.map((game) => (
            <View
              key={game.$id}
              className="flex flex-row items-center justify-center px-5 w-full"
            >
              <TouchableOpacity
                className="w-full"
                onPress={() => handleCardPress(game.gameID)}
              >
                <View className="w-[23rem] h-28 flex flex-col items-center justify-between mb-4 border rounded-lg border-green-300 ">
                  <Image
                    source={{ uri: game.thumb }}
                    className="w-full h-full rounded-2xl "
                  />
                  <Image
                    source={images.cardGradient}
                    className="size-full rounded-xl absolute bottom-0"
                  />

                  <Text
                    numberOfLines={1}
                    className="absolute ml-3 bottom-5 text-lg text-white text-left "
                  >
                    {game.title}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeletePress(game.$id)}>
                <View>
                  <Image source={icons.bin} className="w-10 h-10" />
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default favorites;
