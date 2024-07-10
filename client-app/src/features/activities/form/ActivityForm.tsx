import { Button, Header, Segment } from "semantic-ui-react";
import { useEffect, useState } from "react";
import { useStore } from "../../../app/stores/store";
import { observer } from "mobx-react-lite";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Activity } from "../../../models/activity";
import LoadingComponent from "../../../app/layout/LoadingComponents";
import {v4 as uuid} from 'uuid';
import { Formik, Form } from "formik";
import * as Yup from 'yup';
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { categoryOptions } from "../../../app/common/options/categoryOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";

export default observer(function ActivityForm() {
    const {activityStore} = useStore();
    const {createActivity, updateActivity, loading, loadActivity, loadingInitial} = activityStore;
    const {id} = useParams();
    const navigate = useNavigate();
    const [activity, setActivity] = useState<Activity> ({
        id: '',
        title: '',
        date: null,
        description: '',
        category: '',
        city: '',
        venue: ''
    });

    const ValidationSchema = Yup.object({
        title: Yup.string().required('The activity title is required'),
        description: Yup.string().required('The activity description is required'),
        category: Yup.string().required('The activity category is required'),
        date: Yup.string().required('The activity date is required').nullable(),
        city: Yup.string().required('The activity city is required'),
        venue: Yup.string().required('The activity venue is required'),
    })
    
    useEffect(() => {
        if (id) loadActivity(id).then(activity => setActivity(activity!))
    }, [id, loadActivity])

    function handleFormSubmit(activity: Activity) {
        if (!activity.id) {
            activity.id = uuid();
            createActivity(activity).then(() => navigate(`/activities/${activity.id}`))
        } else {
            updateActivity(activity).then(() => navigate(`/activities/${activity.id}`))
        }
        activity.id ? updateActivity(activity) : createActivity(activity);
    }

    if (loadingInitial) return <LoadingComponent content = "Loading activity..." />

    return(
        <Segment clearing>
            <Header content = 'Activity Details' sub color = "teal" />
            <Formik 
            validationSchema = {ValidationSchema}
                enableReinitialize 
                initialValues = {activity} 
                onSubmit = {values => handleFormSubmit(values)}>
                {({handleSubmit, isValid, isSubmitting, dirty}) => (
                    <Form 
                        className = "ui form" 
                        onSubmit = {handleSubmit} 
                        autoComplete = "off">
                            <MyTextInput  
                                name = "title" 
                                placeholder = "Title" 
                            />              
                            <MyTextArea
                                rows = {3}
                                placeholder = "Description" 
                                name = "description" 
                            />
                            <MySelectInput 
                                options = {categoryOptions} 
                                placeholder = "Category" 
                                name = "category" 
                            />
                            <MyDateInput 
                                placeholderText = "Date" 
                                name = "date" 
                                showTimeSelect
                                timeCaption = "time"
                                dateFormat = "MMMM d, yyyy h:mm aa"
                            />
                            <Header content = 'Location Details' sub color = "teal" />
                            <MyTextInput 
                                placeholder = "City" 
                                name = "city" 
                            />
                            <MyTextInput
                                placeholder = "Venue" 
                                name = "venue" 
                            />
                            <Button 
                                disabled = {isSubmitting || !dirty || !isValid}
                                loading = {loading} 
                                floated = "right" 
                                positive type = "submit" 
                                content = "Submit" 
                            />
                            <Button 
                                as = {Link} to = '/activities' 
                                floated = "right" 
                                type = "button" 
                                content = "Cancel" 
                            />
                    </Form>
                )}
            </Formik> 
        </Segment>
    )
})