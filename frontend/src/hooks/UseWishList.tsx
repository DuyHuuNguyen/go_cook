import {useState} from "react";
import {createCurriculumWishList} from "../clients/CurriculumClient.tsx";


export function useWishList(initialValue = false) {
    const [isWishList, setIsWishList] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    const toggleWishList = async (curriculumId: number) => {
        if (loading) return;

        try {
            setLoading(true);

            const data = await createCurriculumWishList(curriculumId);
            console.log(data.success);
            setIsWishList(data.success);
        } finally {
            setLoading(false);
        }
    };

    return {
        isWishList,
        loading,
        toggleWishList,
    };
}