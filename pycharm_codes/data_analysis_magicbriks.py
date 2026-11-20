import streamlit as st
import pandas as pd


def dataset():
    st.header("PDP BUY Ahmedabad Dataset")
    df_select = df[["Locality", "Address", "Project_Name", "Property_Type", "Bhk_Type", "Price"]]

    filtered_df = df_select
    st.markdown(f"**Total Rows: {filtered_df.shape[0]}&nbsp;&nbsp; & &nbsp;&nbsp; Total Columns: {filtered_df.shape[1]}**")
    st.subheader("Filters")
    cols = st.columns(6)
    selected_locality = cols[0].multiselect("Locality", sorted(df_select["Locality"].dropna().unique()))
    if selected_locality:
        filtered_df = filtered_df[filtered_df["Locality"].isin(selected_locality)]

    selected_project = cols[1].multiselect("Project Name", sorted(df_select["Project_Name"].dropna().unique()))
    if selected_project:
        filtered_df = filtered_df[filtered_df["Project_Name"].isin(selected_project)]

    selected_property_type = cols[2].multiselect("Property Type", sorted(df_select["Property_Type"].dropna().unique()))
    if selected_property_type:
        filtered_df = filtered_df[filtered_df["Property_Type"].isin(selected_property_type)]

    selected_bhk = cols[3].multiselect("BHK Type", sorted(df_select["Bhk_Type"].dropna().unique()))
    if selected_bhk:
        filtered_df = filtered_df[filtered_df["Bhk_Type"].isin(selected_bhk)]

    min_price = int(df_select["Price"].min())
    max_price = int(df_select["Price"].max())
    min_price_input = cols[4].number_input("Minimum Price", min_value=min_price, max_value=max_price, value=min_price)
    max_price_input = cols[5].number_input("Maximum Price", min_value=min_price, max_value=max_price, value=max_price)
    filtered_df = filtered_df[(filtered_df["Price"] >= min_price_input) & (filtered_df["Price"] <= max_price_input)]

    st.dataframe(filtered_df, use_container_width=True, height=700)


def duplicate_value():
    st.header("**Duplicate Values**")
    duplicate_count = df.duplicated().sum()
    if duplicate_count > 0:
        st.warning(f"**Found {duplicate_count} duplicate rows.**")
        duplicate_df = df[df.duplicated(keep=False)]
        st.dataframe(duplicate_df, use_container_width=True, height=700)
    else:
        st.success("**No duplicate rows found.**")


def num_data_analysis():
    st.header("**Numerical Data Analysis**")
    numeric_df = df.dropna(axis=1, how="all")
    description = numeric_df.describe().T
    st.dataframe(description, use_container_width=True, height=750)


def col_data_type():
    st.header("**Column Data Types**")
    dtype_df = pd.DataFrame({
        "Column": df.columns,
        "Data Type": df.dtypes.astype(str).values,
        "Non-Null Count": df.notna().sum().values,
        "Non-Null Count in %": (df.notna().sum().values / len(df) * 100).round(2).astype(str) + "%",
        "Null Count": df.isna().sum().values,
        "Null Count in %": (df.isna().sum().values / len(df) * 100).round(2).astype(str) + "%"
    })
    st.dataframe(dtype_df, use_container_width=True, height=700)


if __name__ == '__main__':
    st.set_page_config(page_title="PDP Buy Ahmedabad Data", layout="wide")
    df = pd.read_csv('pdp_buy_ahmedabad.csv')

    st.title('PDP BUY Ahmedabad Data Analysis')

    st.sidebar.title("Navigation Bar")
    page = st.sidebar.radio("Go to", ["Dataset", "Duplicate Values", "Numerical Data Analysis", "Column Data Types"])

    if page == "Dataset":
        dataset()
    elif page == "Duplicate Values":
        duplicate_value()
    elif page == "Numerical Data Analysis":
        num_data_analysis()
    else:
        col_data_type()

