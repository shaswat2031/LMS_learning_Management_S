import { createContext, useState, useEffect } from "react";
import { api } from "../services/api";
import humanizeDuration from "humanize-duration";


const AppContext = createContext();

const AppContextProvider = (props) => {
    const currency = import.meta.env.VITE_CURRENCY || '$';
    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchAllCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/courses');
            setAllCourses(response.data.courses || []);
        } catch (error) {
            console.error("Error fetching courses:", error);
            setAllCourses([]);
        } finally {
            setLoading(false);
        }
    }

    const calculateRating = (course) => {
        if (!course || !course.courseRating || !Array.isArray(course.courseRating) || course.courseRating.length === 0) {
            return course.rating || 4.5; // Fallback to course.rating or default 4.5
        }
        let totalRating = 0;
        course.courseRating.forEach((rating) => {
            totalRating += rating;
        });
        return totalRating / course.courseRating.length;
    };


    const calculateChapterTime = (chapter) =>{
        if (!chapter || !chapter.chapterContent) return '0 mins';
        let time = 0
        chapter.chapterContent.forEach((lecture) => {
            time += lecture.lectureDuration || 0;
        });
        return humanizeDuration(time * 60 * 1000, {units: ['h', 'm'], round: true, conjunction: ' and ', serialComma: false});
    }

    const calculateCourseDuration = (course) =>{
        if (!course || !course.courseContent) return '0 mins';
        let totalMinutes = 0;
        course.courseContent.forEach((chapter) => {
            if (chapter.chapterContent) {
                chapter.chapterContent.forEach((lecture) => {
                    totalMinutes += lecture.lectureDuration || 0;
                });
            }
        });
        return humanizeDuration(totalMinutes * 60 * 1000, {units: ['h', 'm'], round: true, conjunction: ' and ', serialComma: false});
    }

    const nofolectures = (course) =>{
        if (!course || !course.courseContent) return 0;
        let nooflectures = 0
        course.courseContent.forEach((chapter) => {
            if (chapter.chapterContent) {
                nooflectures += chapter.chapterContent.length;
            }
        });
        return nooflectures;
    }


    // Load courses on component mount
    useEffect(() => {
        fetchAllCourses();
    }, []);

    const value = {
        currency,
        allCourses,
        setAllCourses,
        fetchAllCourses,
        calculateRating,
        isEducator,
        setIsEducator,
        calculateChapterTime,
        nofolectures,
        calculateCourseDuration,
        loading
    };
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
export default AppContextProvider;
export {AppContext};
